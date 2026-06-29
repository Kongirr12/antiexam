/**
 * ExamGuard API Wrapper
 * Handles communication with Google Apps Script Backend
 */
const API = {
    // IMPORTANT: User must set their deployed GAS Web App URL here
    BASE_URL: 'YOUR_GAS_WEB_APP_URL',
    
    /**
     * Generic POST request to GAS
     */
    async post(action, payload = {}) {
        if (this.BASE_URL === 'YOUR_GAS_WEB_APP_URL') {
            console.warn("GAS URL not set. Simulating API response for demo purposes.");
            return this.simulateResponse(action, payload);
        }

        try {
            const response = await fetch(this.BASE_URL, {
                method: 'POST',
                // Text/plain prevents CORS preflight issues with GAS
                headers: {
                    'Content-Type': 'text/plain', 
                },
                body: JSON.stringify({ action, ...payload }),
                mode: 'cors'
            });
            
            const data = await response.json();
            if (data.status !== 'success') {
                throw new Error(data.message || 'Unknown error occurred');
            }
            return data.data;
        } catch (error) {
            console.error(`API Error [${action}]:`, error);
            throw error;
        }
    },

    /**
     * Simulated responses for UI development before GAS is hooked up
     */
    async simulateResponse(action, payload) {
        return new Promise(resolve => {
            setTimeout(() => {
                switch(action) {
                    case 'login':
                        resolve({
                            user: { id: 'U01', name: 'Admin User', role: 'Admin' },
                            token: 'mock-token-123'
                        });
                        break;
                    case 'getUsers':
                        resolve([
                            { id: 'S01', name: 'John Doe', email: 'john@student.com', role: 'Student', grade: '10', room: 'A', status: 'Active' },
                            { id: 'T01', name: 'Jane Smith', email: 'jane@teacher.com', role: 'Teacher', grade: '', room: '', status: 'Active' }
                        ]);
                        break;
                    case 'getExams':
                        resolve([
                            { id: 'E01', name: 'Midterm Math', subject: 'Mathematics', status: 'Upcoming', duration: 60, passing: 50 },
                            { id: 'E02', name: 'Physics Quiz', subject: 'Science', status: 'Active', duration: 30, passing: 60 }
                        ]);
                        break;
                    default:
                        resolve({ success: true });
                }
            }, 800); // simulate network latency
        });
    }
};
