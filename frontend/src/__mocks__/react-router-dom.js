// Mock για το react-router-dom ώστε να μην φορτώνεται το πραγματικό module κατά τη διάρκεια των tests
import React from 'react';

const mockNavigate = jest.fn();

export const Link = ({ children, to }) => <a href={to}>{children}</a>;
export const useNavigate = () => mockNavigate;
export const BrowserRouter = ({ children }) => <div>{children}</div>;
export const Route = ({ children }) => <div>{children}</div>;
export const Routes = ({ children }) => <div>{children}</div>; 