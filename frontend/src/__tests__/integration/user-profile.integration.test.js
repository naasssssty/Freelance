import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Profile from '../../pages/Profile';
import * as userService from '../../services/userService';
import * as authService from '../../services/auth';

// Mock the services
jest.mock('../../services/userService');
jest.mock('../../services/auth');

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false }, action) => {
        switch (action.type) {
          case 'auth/login':
            return { user: action.payload, isAuthenticated: true };
          case 'auth/updateProfile':
            return { ...state, user: { ...state.user, ...action.payload } };
          default:
            return state;
        }
      }
    },
    preloadedState: initialState
  });
};

const renderWithProviders = (component, { initialState = {} } = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </Provider>
    ),
    store
  };
};

describe('User Profile Integration Tests', () => {
  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'CLIENT',
    profile: {
      bio: 'I am a test user',
      skills: ['JavaScript', 'React'],
      hourlyRate: 50,
      availability: 'FULL_TIME',
      location: 'New York, NY',
      phone: '+1-555-0123',
      website: 'https://testuser.com',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/testuser',
        github: 'https://github.com/testuser'
      }
    },
    createdAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service methods
    userService.getUserProfile.mockResolvedValue({ data: mockUser });
    userService.updateProfile.mockResolvedValue({
      data: { ...mockUser, firstName: 'Updated' }
    });
    userService.uploadAvatar.mockResolvedValue({
      data: { avatarUrl: 'https://example.com/avatar.jpg' }
    });
    userService.changePassword.mockResolvedValue({
      data: { success: true, message: 'Password changed successfully' }
    });
    userService.deleteAccount.mockResolvedValue({
      data: { success: true }
    });
  });

  describe('Profile Loading Integration', () => {
    it('should load and display user profile on component mount', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      // Wait for profile to load
      await waitFor(() => {
        expect(userService.getUserProfile).toHaveBeenCalledWith(mockUser.id);
      });

      // Check if profile information is displayed
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
        expect(screen.getByDisplayValue('User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('I am a test user')).toBeInTheDocument();
      });
    });

    it('should handle profile loading errors gracefully', async () => {
      userService.getUserProfile.mockRejectedValue(new Error('Failed to load profile'));

      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
      });
    });
  });

  describe('Basic Profile Update Integration', () => {
    it('should update basic profile information', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      // Wait for profile to load
      await waitFor(() => {
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      });

      // Update first name
      const firstNameInput = screen.getByDisplayValue('Test');
      fireEvent.change(firstNameInput, { target: { value: 'Updated' } });

      // Update bio
      const bioTextarea = screen.getByDisplayValue('I am a test user');
      fireEvent.change(bioTextarea, { target: { value: 'Updated bio' } });

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Wait for update to complete
      await waitFor(() => {
        expect(userService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
          firstName: 'Updated',
          lastName: 'User',
          email: 'test@example.com',
          profile: {
            ...mockUser.profile,
            bio: 'Updated bio'
          }
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate required fields before update', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      });

      // Clear required fields
      const firstNameInput = screen.getByDisplayValue('Test');
      fireEvent.change(firstNameInput, { target: { value: '' } });

      const emailInput = screen.getByDisplayValue('test@example.com');
      fireEvent.change(emailInput, { target: { value: '' } });

      // Try to save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Should not call update service
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });
  });

  describe('Skills Management Integration', () => {
    it('should add and remove skills', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
        expect(screen.getByText('React')).toBeInTheDocument();
      });

      // Add new skill
      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      fireEvent.change(skillInput, { target: { value: 'Node.js' } });
      fireEvent.keyDown(skillInput, { key: 'Enter' });

      // Should show new skill
      await waitFor(() => {
        expect(screen.getByText('Node.js')).toBeInTheDocument();
      });

      // Remove existing skill
      const removeButtons = screen.getAllByRole('button', { name: /remove skill/i });
      fireEvent.click(removeButtons[0]); // Remove JavaScript

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Should update with new skills array
      await waitFor(() => {
        expect(userService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profile: {
            ...mockUser.profile,
            skills: ['React', 'Node.js']
          }
        });
      });
    });

    it('should prevent duplicate skills', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByText('JavaScript')).toBeInTheDocument();
      });

      // Try to add existing skill
      const skillInput = screen.getByPlaceholderText(/add a skill/i);
      fireEvent.change(skillInput, { target: { value: 'JavaScript' } });
      fireEvent.keyDown(skillInput, { key: 'Enter' });

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/skill already exists/i)).toBeInTheDocument();
      });

      // Skill should not be duplicated
      const javascriptSkills = screen.getAllByText('JavaScript');
      expect(javascriptSkills).toHaveLength(1);
    });
  });

  describe('Avatar Upload Integration', () => {
    it('should upload and update user avatar', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      });

      // Mock file upload
      const file = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText(/upload avatar/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false
      });

      fireEvent.change(fileInput);

      // Wait for upload to complete
      await waitFor(() => {
        expect(userService.uploadAvatar).toHaveBeenCalledWith(mockUser.id, expect.any(FormData));
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/avatar updated successfully/i)).toBeInTheDocument();
      });
    });

    it('should validate file type and size for avatar upload', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
      });

      // Try to upload invalid file type
      const invalidFile = new File(['text'], 'document.txt', { type: 'text/plain' });
      const fileInput = screen.getByLabelText(/upload avatar/i);
      
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false
      });

      fireEvent.change(fileInput);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/please select a valid image file/i)).toBeInTheDocument();
      });

      // Should not call upload service
      expect(userService.uploadAvatar).not.toHaveBeenCalled();
    });
  });

  describe('Password Change Integration', () => {
    it('should change user password successfully', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      // Navigate to security tab
      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      });

      // Fill password form
      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: 'currentpass123' }
      });
      fireEvent.change(screen.getByLabelText(/new password/i), {
        target: { value: 'newpass123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: 'newpass123' }
      });

      // Submit password change
      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      fireEvent.click(changePasswordButton);

      // Wait for password change
      await waitFor(() => {
        expect(userService.changePassword).toHaveBeenCalledWith(mockUser.id, {
          currentPassword: 'currentpass123',
          newPassword: 'newpass123'
        });
      });

      // Should show success message
      await waitFor(() => {
        expect(screen.getByText(/password changed successfully/i)).toBeInTheDocument();
      });

      // Form should be cleared
      expect(screen.getByLabelText(/current password/i).value).toBe('');
      expect(screen.getByLabelText(/new password/i).value).toBe('');
      expect(screen.getByLabelText(/confirm new password/i).value).toBe('');
    });

    it('should validate password confirmation match', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      await waitFor(() => {
        expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      });

      // Fill with mismatched passwords
      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: 'currentpass123' }
      });
      fireEvent.change(screen.getByLabelText(/new password/i), {
        target: { value: 'newpass123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: 'differentpass' }
      });

      const changePasswordButton = screen.getByRole('button', { name: /change password/i });
      fireEvent.click(changePasswordButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Should not call change password service
      expect(userService.changePassword).not.toHaveBeenCalled();
    });
  });

  describe('Account Deletion Integration', () => {
    it('should delete user account with proper confirmation', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      // Navigate to security tab
      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      // Find delete account button
      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });

      // Type confirmation text
      const confirmationInput = screen.getByPlaceholderText(/type "DELETE" to confirm/i);
      fireEvent.change(confirmationInput, { target: { value: 'DELETE' } });

      // Confirm deletion
      const confirmDeleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmDeleteButton);

      // Wait for deletion
      await waitFor(() => {
        expect(userService.deleteAccount).toHaveBeenCalledWith(mockUser.id);
      });

      // Should show success message and redirect
      await waitFor(() => {
        expect(screen.getByText(/account deleted successfully/i)).toBeInTheDocument();
      });
    });

    it('should require proper confirmation text for account deletion', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      fireEvent.click(securityTab);

      const deleteButton = screen.getByRole('button', { name: /delete account/i });
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
      });

      // Try with wrong confirmation text
      const confirmationInput = screen.getByPlaceholderText(/type "DELETE" to confirm/i);
      fireEvent.change(confirmationInput, { target: { value: 'wrong' } });

      const confirmDeleteButton = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmDeleteButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/please type "DELETE" to confirm/i)).toBeInTheDocument();
      });

      // Should not call delete service
      expect(userService.deleteAccount).not.toHaveBeenCalled();
    });
  });

  describe('Social Links Integration', () => {
    it('should update social media links', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://linkedin.com/in/testuser')).toBeInTheDocument();
      });

      // Update LinkedIn URL
      const linkedinInput = screen.getByDisplayValue('https://linkedin.com/in/testuser');
      fireEvent.change(linkedinInput, { 
        target: { value: 'https://linkedin.com/in/updateduser' } 
      });

      // Add Twitter link
      const twitterInput = screen.getByLabelText(/twitter/i);
      fireEvent.change(twitterInput, { 
        target: { value: 'https://twitter.com/testuser' } 
      });

      // Save changes
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Should update with new social links
      await waitFor(() => {
        expect(userService.updateProfile).toHaveBeenCalledWith(mockUser.id, {
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          profile: {
            ...mockUser.profile,
            socialLinks: {
              linkedin: 'https://linkedin.com/in/updateduser',
              github: 'https://github.com/testuser',
              twitter: 'https://twitter.com/testuser'
            }
          }
        });
      });
    });

    it('should validate social media URL formats', async () => {
      const initialState = {
        auth: { user: mockUser, isAuthenticated: true }
      };

      renderWithProviders(<Profile />, { initialState });

      await waitFor(() => {
        expect(screen.getByDisplayValue('https://linkedin.com/in/testuser')).toBeInTheDocument();
      });

      // Enter invalid URL
      const linkedinInput = screen.getByDisplayValue('https://linkedin.com/in/testuser');
      fireEvent.change(linkedinInput, { target: { value: 'invalid-url' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid URL/i)).toBeInTheDocument();
      });

      // Should not call update service
      expect(userService.updateProfile).not.toHaveBeenCalled();
    });
  });
}); 