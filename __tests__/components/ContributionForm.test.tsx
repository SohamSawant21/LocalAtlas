import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, test, vi, describe, beforeEach, afterEach } from 'vitest';
import { ContributionForm } from '@/components/contribute/ContributionForm';
import { submitContributionAction } from '@/actions/locations';
import { getPresignedUrlAction } from '@/actions/storage';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/actions/locations', () => ({
  submitContributionAction: vi.fn(),
}));

vi.mock('@/actions/storage', () => ({
  getPresignedUrlAction: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock global fetch for S3 upload
const originalFetch = global.fetch;

describe('ContributionForm Upload Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    
    // Default mocks
    (submitContributionAction as any).mockResolvedValue({ success: true, data: {} });
    (getPresignedUrlAction as any).mockResolvedValue({
      success: true,
      data: { presignedUrl: 'https://fake-s3-url', publicUrl: 'https://fake-public-url' }
    });
    (global.fetch as any).mockResolvedValue({ ok: true });
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
  });

  const fillBasicFormAndGoToUpload = async () => {
    render(<ContributionForm />);
    
    // Step 1
    fireEvent.change(screen.getByLabelText('Location Name'), { target: { value: 'Test Location' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'This is a test description with enough length.' } });
    fireEvent.click(screen.getByText('Continue'));
    
    // Step 2
    fireEvent.click(screen.getByText('Continue'));
    
    // Should be on Step 3 (Media Upload)
    expect(screen.getByText('Upload Images')).toBeDefined();
  };
  
  const createFakeFile = (name: string, type: string, size: number) => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
  };

  test('validates MIME types and size limits', async () => {
    await fillBasicFormAndGoToUpload();
    
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const validFile = createFakeFile('valid.jpg', 'image/jpeg', 1024);
    const invalidTypeFile = createFakeFile('invalid.txt', 'text/plain', 1024);
    const hugeFile = createFakeFile('huge.png', 'image/png', 10 * 1024 * 1024); // 10MB
    
    fireEvent.change(input, { target: { files: [validFile, invalidTypeFile, hugeFile] } });
    
    expect(toast.error).toHaveBeenCalledWith('Some files were skipped. Only JPEG, PNG, and WEBP under 5MB are allowed.');
    expect(screen.getByText('1 file(s) selected')).toBeDefined();
  });

  test('validates maximum image count', async () => {
    await fillBasicFormAndGoToUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const files = Array.from({ length: 6 }).map((_, i) => createFakeFile(`file${i}.jpg`, 'image/jpeg', 1024));
    
    fireEvent.change(input, { target: { files } });
    
    expect(toast.error).toHaveBeenCalledWith('Maximum 5 images allowed.');
    expect(screen.getByText('5 file(s) selected')).toBeDefined();
  });

  test('successful upload flow and contribution submission with uploaded images', async () => {
    await fillBasicFormAndGoToUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const validFile = createFakeFile('test.jpg', 'image/jpeg', 1024);
    fireEvent.change(input, { target: { files: [validFile] } });
    
    // Go to Review
    fireEvent.click(screen.getByText('Continue'));
    
    // Submit
    fireEvent.click(screen.getByText('Submit Contribution'));
    
    // Confirm modal
    fireEvent.click(screen.getByText('Yes, Submit'));
    
    await waitFor(() => {
      expect(getPresignedUrlAction).toHaveBeenCalledWith({
        fileType: 'image/jpeg',
        fileSize: 1024,
        folder: 'locations'
      });
      expect(global.fetch).toHaveBeenCalledWith('https://fake-s3-url', expect.any(Object));
      expect(submitContributionAction).toHaveBeenCalledWith(expect.objectContaining({
        images: ['https://fake-public-url']
      }));
      expect(toast.success).toHaveBeenCalledWith('Contribution submitted successfully!');
    });
  });

  test('upload failure prevents submission', async () => {
    (global.fetch as any).mockResolvedValueOnce({ ok: false }); // simulate S3 upload failure
    
    await fillBasicFormAndGoToUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = createFakeFile('test.jpg', 'image/jpeg', 1024);
    fireEvent.change(input, { target: { files: [validFile] } });
    
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Submit Contribution'));
    fireEvent.click(screen.getByText('Yes, Submit'));
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Upload failed for test.jpg');
      expect(submitContributionAction).not.toHaveBeenCalled();
    });
  });

  test('multiple image upload', async () => {
    // Return different public URLs for multiple files
    let callCount = 0;
    (getPresignedUrlAction as any).mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        success: true,
        data: { presignedUrl: `https://fake-s3-url-${callCount}`, publicUrl: `https://fake-public-url-${callCount}` }
      });
    });

    await fillBasicFormAndGoToUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    const file1 = createFakeFile('test1.jpg', 'image/jpeg', 1024);
    const file2 = createFakeFile('test2.png', 'image/png', 2048);
    fireEvent.change(input, { target: { files: [file1, file2] } });
    
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Submit Contribution'));
    fireEvent.click(screen.getByText('Yes, Submit'));
    
    await waitFor(() => {
      expect(getPresignedUrlAction).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(submitContributionAction).toHaveBeenCalledWith(expect.objectContaining({
        images: ['https://fake-public-url-1', 'https://fake-public-url-2']
      }));
    });
  });

  test('contribution without images (if supported)', async () => {
    await fillBasicFormAndGoToUpload();
    // Skip uploading images
    fireEvent.click(screen.getByText('Continue'));
    fireEvent.click(screen.getByText('Submit Contribution'));
    fireEvent.click(screen.getByText('Yes, Submit'));
    
    await waitFor(() => {
      expect(getPresignedUrlAction).not.toHaveBeenCalled();
      expect(submitContributionAction).toHaveBeenCalledWith(expect.objectContaining({
        images: []
      }));
    });
  });
});
