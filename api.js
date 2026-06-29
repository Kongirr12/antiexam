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
                        if (payload.id && payload.id.toLowerCase().includes('student')) {
                            resolve({
                                user: { id: 'S01', name: 'John Student', role: 'Student' },
                                token: 'mock-token-stu'
                            });
                        } else {
                            resolve({
                                user: { id: 'U01', name: 'Admin User', role: 'Admin' },
                                token: 'mock-token-123'
                            });
                        }
                        break;
                    case 'getUsers':
                        resolve([
                            { id: 'S01', name: 'John Doe', email: 'john@student.com', role: 'Student', grade: '10', room: 'A', status: 'Active' },
                            { id: 'T01', name: 'Jane Smith', email: 'jane@teacher.com', role: 'Teacher', grade: '', room: '', status: 'Active' }
                        ]);
                        break;
                    case 'getExams':
                        resolve([
                            { id: 'E01', name: 'Midterm Math', subject: 'Mathematics', status: 'Active', duration: 60, passing: 50 },
                            { id: 'E02', name: 'Physics Quiz', subject: 'Science', status: 'Draft', duration: 30, passing: 60 }
                        ]);
                        break;
                    case 'getImages':
                        resolve([
                            { id: 'IMG01', name: 'diagram_cell.png', url: 'https://via.placeholder.com/150/e0f2fe/0369a1?text=Cell+Diagram', date: '2023-10-01' },
                            { id: 'IMG02', name: 'math_graph.jpg', url: 'https://via.placeholder.com/150/f3e8ff/7e22ce?text=Math+Graph', date: '2023-10-05' }
                        ]);
                        break;
                    case 'getQuestions':
                        resolve([
                            { id: 'Q01', type: 'SingleChoice', content: 'What is the powerhouse of the cell?', score: 1 },
                            { id: 'Q02', type: 'MultipleChoice', content: 'Select all prime numbers:', score: 2 },
                            { id: 'Q03', type: 'Essay', content: 'Explain the theory of relativity $E=mc^2$.', score: 10 }
                        ]);
                        break;
                    default:
                        resolve({ success: true });
                }
            }, 800); // simulate network latency
        });
    }
};
