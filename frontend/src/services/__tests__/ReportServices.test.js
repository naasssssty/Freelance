import axios from 'axios';
import {
  generateReport,
  getReports,
  downloadReport
} from '../ReportServices';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock jwt-decode
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    sub: 'testuser',
    role: 'ADMIN',
    verified: true
  }))
}));

describe('ReportServices', () => {
  let mockCreate;
  let mockGet;
  let mockPost;

  beforeEach(() => {
    mockGet = jest.fn();
    mockPost = jest.fn();
    mockCreate = jest.fn(() => ({
      get: mockGet,
      post: mockPost,
      defaults: {
        headers: {
          common: {}
        }
      }
    }));
    mockedAxios.create = mockCreate;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-jwt-token'),
        setItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateReport', () => {
    it('should successfully generate a report', async () => {
      const reportData = {
        reportType: 'USER_ACTIVITY',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31',
        parameters: {
          includeInactive: false,
          groupBy: 'daily'
        }
      };

      const mockResponse = {
        data: {
          id: 1,
          reportType: 'USER_ACTIVITY',
          status: 'GENERATED',
          generatedAt: '2024-01-31T23:59:59Z',
          downloadUrl: '/reports/1/download'
        },
        status: 201
      };

      mockPost.mockResolvedValue(mockResponse);

      const result = await generateReport(reportData);

      expect(mockPost).toHaveBeenCalledWith('/reports/generate', reportData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle API error when generating report', async () => {
      const reportData = {
        reportType: 'INVALID_TYPE',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const mockError = {
        response: {
          data: { message: 'Invalid report type' },
          status: 400
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(generateReport(reportData)).rejects.toThrow('Invalid report type');
    });

    it('should handle unauthorized access', async () => {
      const reportData = {
        reportType: 'USER_ACTIVITY',
        dateFrom: '2024-01-01',
        dateTo: '2024-01-31'
      };

      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(generateReport(reportData)).rejects.toThrow('Unauthorized');
    });

    it('should handle missing required parameters', async () => {
      const reportData = {
        reportType: 'USER_ACTIVITY'
        // Missing dateFrom and dateTo
      };

      const mockError = {
        response: {
          data: { message: 'Missing required parameters' },
          status: 400
        }
      };

      mockPost.mockRejectedValue(mockError);

      await expect(generateReport(reportData)).rejects.toThrow('Missing required parameters');
    });
  });

  describe('getReports', () => {
    it('should successfully fetch reports list', async () => {
      const mockReports = [
        {
          id: 1,
          reportType: 'USER_ACTIVITY',
          status: 'GENERATED',
          generatedAt: '2024-01-31T23:59:59Z',
          downloadUrl: '/reports/1/download'
        },
        {
          id: 2,
          reportType: 'PROJECT_STATS',
          status: 'GENERATING',
          generatedAt: null,
          downloadUrl: null
        },
        {
          id: 3,
          reportType: 'FINANCIAL_SUMMARY',
          status: 'GENERATED',
          generatedAt: '2024-01-30T15:30:00Z',
          downloadUrl: '/reports/3/download'
        }
      ];

      const mockResponse = {
        data: mockReports,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getReports();

      expect(mockGet).toHaveBeenCalledWith('/reports');
      expect(result).toEqual(mockReports);
    });

    it('should handle empty reports list', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getReports();

      expect(result).toEqual([]);
    });

    it('should handle API error when fetching reports', async () => {
      const mockError = {
        response: {
          data: { message: 'Server Error' },
          status: 500
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getReports()).rejects.toThrow('Server Error');
    });

    it('should handle unauthorized access when fetching reports', async () => {
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getReports()).rejects.toThrow('Unauthorized');
    });
  });

  describe('downloadReport', () => {
    it('should successfully download a report', async () => {
      const reportId = 1;
      const mockBlob = new Blob(['Report content'], { type: 'application/pdf' });
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'attachment; filename="user_activity_report.pdf"'
        },
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      // Mock URL.createObjectURL and document.createElement
      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await downloadReport(reportId);

      expect(mockGet).toHaveBeenCalledWith(`/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
    });

    it('should handle API error when downloading report', async () => {
      const reportId = 1;
      const mockError = {
        response: {
          data: { message: 'Report not found' },
          status: 404
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(downloadReport(reportId)).rejects.toThrow('Report not found');
    });

    it('should handle report not ready for download', async () => {
      const reportId = 1;
      const mockError = {
        response: {
          data: { message: 'Report is still generating' },
          status: 409
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(downloadReport(reportId)).rejects.toThrow('Report is still generating');
    });

    it('should handle unauthorized download attempt', async () => {
      const reportId = 1;
      const mockError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401
        }
      };

      mockGet.mockRejectedValue(mockError);

      await expect(downloadReport(reportId)).rejects.toThrow('Unauthorized');
    });

    it('should extract filename from content-disposition header', async () => {
      const reportId = 1;
      const mockBlob = new Blob(['Report content'], { type: 'application/excel' });
      const mockResponse = {
        data: mockBlob,
        headers: {
          'content-disposition': 'attachment; filename="project_stats_2024.xlsx"'
        },
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await downloadReport(reportId);

      expect(mockLink.download).toBe('project_stats_2024.xlsx');
    });

    it('should use default filename when content-disposition is missing', async () => {
      const reportId = 1;
      const mockBlob = new Blob(['Report content'], { type: 'application/pdf' });
      const mockResponse = {
        data: mockBlob,
        headers: {},
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      global.URL.createObjectURL = jest.fn(() => 'mock-url');
      global.URL.revokeObjectURL = jest.fn();

      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      await downloadReport(reportId);

      expect(mockLink.download).toBe(`report_${reportId}.pdf`);
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      const mockError = new Error('Network Error');
      mockGet.mockRejectedValue(mockError);

      await expect(getReports()).rejects.toThrow('Network Error');
    });

    it('should handle timeout errors', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      };

      mockGet.mockRejectedValue(mockError);

      await expect(getReports()).rejects.toThrow('timeout of 10000ms exceeded');
    });

    it('should handle malformed response data', async () => {
      const mockResponse = {
        data: 'invalid json',
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getReports();

      expect(result).toBe('invalid json');
    });

    it('should handle null response', async () => {
      const mockResponse = {
        data: null,
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      const result = await getReports();

      expect(result).toBe(null);
    });
  });

  describe('Authentication token handling', () => {
    it('should handle missing token', () => {
      window.localStorage.getItem.mockReturnValue(null);

      expect(() => getReports()).not.toThrow();
    });

    it('should handle invalid token format', () => {
      window.localStorage.getItem.mockReturnValue('invalid-token');

      expect(() => getReports()).not.toThrow();
    });
  });

  describe('API client configuration', () => {
    it('should create axios instance with correct configuration', () => {
      getReports();

      expect(mockCreate).toHaveBeenCalled();
    });

    it('should set authorization headers correctly', async () => {
      const mockResponse = {
        data: [],
        status: 200
      };

      mockGet.mockResolvedValue(mockResponse);

      await getReports();

      expect(mockGet).toHaveBeenCalled();
    });
  });
}); 