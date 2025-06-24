import axios from 'axios';
import * as ChatServices from '../ChatServices';
import * as authUtils from '../../utils/auth';

// Mock dependencies
jest.mock('axios');
jest.mock('../../utils/auth');

// Mock console
const originalConsoleError = console.error;
beforeAll(() => {
    console.error = jest.fn();
});

afterAll(() => {
    console.error = originalConsoleError;
});

describe('ChatServices', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        authUtils.getTokenAndDecode.mockReturnValue({
            token: 'mock.jwt.token',
            username: 'testuser'
        });
    });

    describe('sendMessage', () => {
        it('should successfully send a message', async () => {
            const projectId = 123;
            const content = 'Hello, this is a test message';
            const mockResponse = {
                data: {
                    id: 1,
                    projectId: 123,
                    content: content,
                    sender: 'testuser',
                    timestamp: '2024-01-01T10:00:00Z'
                }
            };
            
            axios.post.mockResolvedValue(mockResponse);

            const result = await ChatServices.sendMessage(projectId, content);

            expect(authUtils.getTokenAndDecode).toHaveBeenCalled();
            expect(axios.post).toHaveBeenCalledWith(
                '/api/chat/123/send',
                { content: content },
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                        'Content-Type': 'application/json',
                    },
                }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should handle send message error', async () => {
            const projectId = 123;
            const content = 'Test message';
            const mockError = new Error('Network error');
            
            axios.post.mockRejectedValue(mockError);

            await expect(ChatServices.sendMessage(projectId, content)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error sending message:', mockError);
        });

        it('should handle token error', async () => {
            const projectId = 123;
            const content = 'Test message';
            const tokenError = new Error('No token found');
            
            authUtils.getTokenAndDecode.mockImplementation(() => {
                throw tokenError;
            });

            await expect(ChatServices.sendMessage(projectId, content)).rejects.toThrow(tokenError);
        });

        it('should send message with different content types', async () => {
            const testCases = [
                { projectId: 1, content: 'Simple message' },
                { projectId: 2, content: 'Message with special chars: !@#$%^&*()' },
                { projectId: 3, content: 'Long message: ' + 'a'.repeat(1000) },
                { projectId: 4, content: 'Message with\nnewlines\nand\ttabs' }
            ];

            for (const testCase of testCases) {
                const mockResponse = { data: { id: 1, content: testCase.content } };
                axios.post.mockResolvedValue(mockResponse);

                const result = await ChatServices.sendMessage(testCase.projectId, testCase.content);

                expect(axios.post).toHaveBeenCalledWith(
                    `/api/chat/${testCase.projectId}/send`,
                    { content: testCase.content },
                    expect.any(Object)
                );
                expect(result).toEqual(mockResponse.data);
            }
        });
    });

    describe('getMessages', () => {
        it('should successfully get messages', async () => {
            const projectId = 123;
            const mockMessages = [
                {
                    id: 1,
                    projectId: 123,
                    content: 'First message',
                    sender: 'client',
                    timestamp: '2024-01-01T10:00:00Z'
                },
                {
                    id: 2,
                    projectId: 123,
                    content: 'Second message',
                    sender: 'freelancer',
                    timestamp: '2024-01-01T10:01:00Z'
                }
            ];
            const mockResponse = { data: mockMessages };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ChatServices.getMessages(projectId);

            expect(authUtils.getTokenAndDecode).toHaveBeenCalled();
            expect(axios.get).toHaveBeenCalledWith(
                '/api/chat/123/messages',
                {
                    headers: {
                        'Authorization': 'Bearer mock.jwt.token',
                    },
                }
            );
            expect(result).toEqual(mockMessages);
        });

        it('should handle get messages error', async () => {
            const projectId = 123;
            const mockError = new Error('Server error');
            
            axios.get.mockRejectedValue(mockError);

            await expect(ChatServices.getMessages(projectId)).rejects.toThrow(mockError);
            expect(console.error).toHaveBeenCalledWith('Error fetching messages:', mockError);
        });

        it('should handle token error when getting messages', async () => {
            const projectId = 123;
            const tokenError = new Error('Invalid token');
            
            authUtils.getTokenAndDecode.mockImplementation(() => {
                throw tokenError;
            });

            await expect(ChatServices.getMessages(projectId)).rejects.toThrow(tokenError);
        });

        it('should get messages for different projects', async () => {
            const projectIds = [1, 2, 3, 100, 999];

            for (const projectId of projectIds) {
                const mockResponse = { data: [{ id: 1, projectId: projectId }] };
                axios.get.mockResolvedValue(mockResponse);

                const result = await ChatServices.getMessages(projectId);

                expect(axios.get).toHaveBeenCalledWith(
                    `/api/chat/${projectId}/messages`,
                    expect.any(Object)
                );
                expect(result).toEqual(mockResponse.data);
            }
        });

        it('should handle empty messages response', async () => {
            const projectId = 123;
            const mockResponse = { data: [] };
            
            axios.get.mockResolvedValue(mockResponse);

            const result = await ChatServices.getMessages(projectId);

            expect(result).toEqual([]);
        });
    });

    describe('Authentication integration', () => {
        it('should use token from getTokenAndDecode for both functions', async () => {
            const mockResponse = { data: {} };
            axios.post.mockResolvedValue(mockResponse);
            axios.get.mockResolvedValue(mockResponse);

            await ChatServices.sendMessage(1, 'test');
            await ChatServices.getMessages(1);

            expect(authUtils.getTokenAndDecode).toHaveBeenCalledTimes(2);
        });

        it('should handle different token scenarios', async () => {
            const scenarios = [
                { token: 'valid.token.123', username: 'user1' },
                { token: 'another.valid.token', username: 'user2' },
                { token: 'long.jwt.token.with.many.parts', username: 'admin' }
            ];

            for (const scenario of scenarios) {
                authUtils.getTokenAndDecode.mockReturnValue(scenario);
                const mockResponse = { data: {} };
                axios.post.mockResolvedValue(mockResponse);

                await ChatServices.sendMessage(1, 'test');

                expect(axios.post).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.any(Object),
                    expect.objectContaining({
                        headers: expect.objectContaining({
                            'Authorization': `Bearer ${scenario.token}`
                        })
                    })
                );
            }
        });
    });
});
