// Application Configuration
const CONFIG = {
    SCROLL_THRESHOLD: 100,
    TOAST_DURATION: 3000,
    TOAST_FADE_DURATION: 300
};

// State management
const state = {
    currentSection: 'home',
    isMobileMenuOpen: false,
    isHeaderVisible: true,
    lastScrollPosition: 0,
    isLoading: false
};

// Event names
const EVENTS = {
    SECTION_CHANGE: 'sectionChange',
    MENU_TOGGLE: 'menuToggle',
    COMMENT_ADDED: 'commentAdded'
};

// Custom event emitter
const eventEmitter = {
    dispatch(eventName, detail = {}) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    },
    subscribe(eventName, handler) {
        document.addEventListener(eventName, handler);
        return () => document.removeEventListener(eventName, handler);
    }
};

// DOM Elements
const header = document.querySelector('header');
const mobileMenuBtn = document.querySelector('#mobile-menu-btn');
const mobileMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('[data-section]');
const sections = document.querySelectorAll('.section-content');
const commentForm = document.querySelector('#comment-form');
const commentsContainer = document.querySelector('#comments-container');

// Initialize the application
class App {
    static init() {
        this.initializeNavigation();
        this.initializeMobileMenu();
        this.initializeScrollHeader();
        this.initializeComments();
        this.initializeEventListeners();
        showSection('home');
    }

    static initializeEventListeners() {
        eventEmitter.subscribe(EVENTS.SECTION_CHANGE, ({ detail }) => {
            console.log(`Section changed to: ${detail.section}`);
        });

        eventEmitter.subscribe(EVENTS.MENU_TOGGLE, ({ detail }) => {
            console.log(`Menu ${detail.isOpen ? 'opened' : 'closed'}`);
        });

        eventEmitter.subscribe(EVENTS.COMMENT_ADDED, ({ detail }) => {
            console.log(`New comment added: ${detail.id}`);
        });
    }
}

// KnowNook feature for doubt solving
const KnowNook = {
    GEMINI_API_KEY: 'AIzaSyCXwh94WjZT-OgSOKh00QsYSsr-t3UPZBk',
    API_ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',

    async solveDoubt(input) {
        try {
            if (!input.trim()) {
                Toast.show('Please enter your doubt', 'error');
                return;
            }

            const doubtOutput = document.getElementById('doubtOutput');
            if (!doubtOutput) return;

            doubtOutput.innerHTML = `
                <div class="flex justify-center items-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            `;

            const response = await fetch(`${this.API_ENDPOINT}?key=${this.GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: input
                        }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            const data = await response.json();
            const answer = data.candidates[0].content.parts[0].text;

            // Save to doubt history
            await this.saveDoubt(input, answer);

            // Display the answer
            doubtOutput.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md">
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">Answer:</h3>
                    <p class="text-gray-700 whitespace-pre-wrap">${answer}</p>
                </div>
            `;

            await this.displayDoubtHistory();
        } catch (error) {
            console.error('Error solving doubt:', error);
            const errorMessage = error.message.includes('API request failed') ?
                'Failed to connect to AI service. Please try again.' :
                'An error occurred while processing your doubt.';
            Toast.show(errorMessage, 'error');

            const doubtOutput = document.getElementById('doubtOutput');
            if (doubtOutput) {
                doubtOutput.innerHTML = `
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-red-600">${errorMessage}</p>
                    </div>
                `;
            }
        }
    },

    async saveDoubt(question, answer) {
        try {
            const history = JSON.parse(localStorage.getItem('doubtHistory') || '[]');
            const newDoubt = {
                question,
                answer,
                timestamp: new Date().toISOString()
            };

            // Keep only the last 5 doubts
            history.unshift(newDoubt);
            if (history.length > 5) history.pop();

            localStorage.setItem('doubtHistory', JSON.stringify(history));
        } catch (error) {
            console.error('Error saving doubt:', error);
            throw new Error('Failed to save doubt history');
        }
    },

    async displayDoubtHistory() {
        try {
            const historyContainer = document.getElementById('doubtHistory');
            if (!historyContainer) return;

            const history = JSON.parse(localStorage.getItem('doubtHistory') || '[]');
            if (history.length === 0) {
                historyContainer.innerHTML = '<p class="text-gray-500 text-center">No previous doubts found.</p>';
                return;
            }

            historyContainer.innerHTML = history.map(doubt => `
                <div class="bg-gray-50 p-4 rounded-lg mb-4 shadow-sm">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-medium text-gray-800">Q: ${doubt.question}</h4>
                        <time class="text-xs text-gray-500" datetime="${doubt.timestamp}">
                            ${formatDate(doubt.timestamp)}
                        </time>
                    </div>
                    <p class="text-sm text-gray-600">A: ${doubt.answer}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error displaying doubt history:', error);
            Toast.show('Failed to load doubt history', 'error');
        }
    }
};

// StudyBite object for managing daily challenges
const StudyBite = {
    challenges: [
        { topic: "Math", question: "Solve: 2x + 3 = 7", answer: "x = 2" },
        { topic: "Physics", question: "What is Newton's First Law?", answer: "An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force." },
        { topic: "Chemistry", question: "What is the atomic number of Carbon?", answer: "6" },
        { topic: "Biology", question: "What is photosynthesis?", answer: "The process by which plants convert light energy into chemical energy to produce glucose from carbon dioxide and water." },
        { topic: "Computer Science", question: "What is a variable?", answer: "A container for storing data values in programming." },
        { topic: "Literature", question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare" },
        { topic: "History", question: "When did World War II end?", answer: "1945" },
        { topic: "Geography", question: "What is the capital of France?", answer: "Paris" },
        { topic: "Art", question: "Who painted the Mona Lisa?", answer: "Leonardo da Vinci" },
        { topic: "Music", question: "What are the basic elements of music?", answer: "Rhythm, melody, harmony, and timbre" }
    ],

    async loadChallenge() {
        try {
            const challengeDisplay = document.getElementById('challengeDisplay');
            if (!challengeDisplay) return;

            const randomIndex = Math.floor(Math.random() * this.challenges.length);
            const challenge = this.challenges[randomIndex];
            
            challengeDisplay.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-md" role="article">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-800">${challenge.topic}</h3>
                        <button class="new-challenge-btn bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors"
                                aria-label="Load new challenge">
                            New Challenge
                        </button>
                    </div>
                    <p class="text-gray-700 mb-4">${challenge.question}</p>
                    <div class="answer-section hidden">
                        <p class="text-gray-600 italic">${challenge.answer}</p>
                    </div>
                    <button class="show-answer-btn bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                            aria-expanded="false">
                        Show Answer
                    </button>
                </div>
            `;

            const showAnswerBtn = challengeDisplay.querySelector('.show-answer-btn');
            const newChallengeBtn = challengeDisplay.querySelector('.new-challenge-btn');
            const answerSection = challengeDisplay.querySelector('.answer-section');

            showAnswerBtn.addEventListener('click', () => {
                answerSection.classList.toggle('hidden');
                const isExpanded = answerSection.classList.contains('hidden');
                showAnswerBtn.textContent = isExpanded ? 'Show Answer' : 'Hide Answer';
                showAnswerBtn.setAttribute('aria-expanded', !isExpanded);

                if (!isExpanded) {
                    this.saveCompletedChallenge(challenge);
                }
            });

            newChallengeBtn.addEventListener('click', async () => {
                try {
                    newChallengeBtn.disabled = true;
                    newChallengeBtn.classList.add('opacity-50', 'cursor-not-allowed');
                    await this.loadChallenge();
                    Toast.show('New challenge loaded!');
                } catch (error) {
                    console.error('Error loading new challenge:', error);
                    Toast.show('Failed to load new challenge', 'error');
                } finally {
                    newChallengeBtn.disabled = false;
                    newChallengeBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });

            await this.displayCompletedChallenges();
        } catch (error) {
            console.error('Error loading challenge:', error);
            Toast.show('Failed to load challenge', 'error');
        }
    },

    async saveCompletedChallenge(challenge) {
        try {
            const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
            const newCompletion = {
                ...challenge,
                completedAt: new Date().toISOString()
            };
            completed.push(newCompletion);
            localStorage.setItem('completedChallenges', JSON.stringify(completed));
            await this.displayCompletedChallenges();
            Toast.show('Challenge completed!');
        } catch (error) {
            console.error('Error saving completed challenge:', error);
            Toast.show('Failed to save progress', 'error');
        }
    },

    async displayCompletedChallenges() {
        try {
            const completedList = document.getElementById('completedChallenges');
            if (!completedList) return;

            const completed = JSON.parse(localStorage.getItem('completedChallenges') || '[]');
            if (completed.length === 0) {
                completedList.innerHTML = '<p class="text-gray-500 text-center" role="status">No completed challenges yet. Start solving!</p>';
                return;
            }

            completedList.innerHTML = completed
                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                .map(challenge => `
                    <div class="bg-gray-50 p-4 rounded-lg mb-3 shadow-sm" role="listitem">
                        <h4 class="font-medium text-gray-800">${challenge.topic}</h4>
                        <p class="text-sm text-gray-600 mt-1">${challenge.question}</p>
                        <time class="text-xs text-gray-500 block mt-2" datetime="${challenge.completedAt}">
                            Completed: ${formatDate(challenge.completedAt)}
                        </time>
                    </div>
                `)
                .join('');
        } catch (error) {
            console.error('Error displaying completed challenges:', error);
            Toast.show('Failed to load completed challenges', 'error');
        }
    }
};

// Initialize the application
class App {
    static async init() {
        try {
            const currentSection = localStorage.getItem('currentSection') || 'home';
            await this.initializeEventListeners();
            await this.initializeScrollBehavior();
            await CommentsManager.loadComments();
            await StudyBite.loadChallenge();
            await StudySync.displayGroupEvents();
            await CheatNotes.displayNotes();
            await Timetable.displaySchedule();
                
            // Initialize MindMesh
            if (typeof p5 !== 'undefined') {
                MindMesh.setup();
            } else {
                console.warn('p5.js is not loaded. MindMesh feature will not be available.');
            }

            showSection(currentSection);

            // Initialize StudySync form
            const groupEventForm = document.getElementById('groupEventForm');
            if (groupEventForm) {
                groupEventForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const eventNameInput = document.getElementById('eventName');
                    const eventDateInput = document.getElementById('eventDate');
                    
                    const name = eventNameInput.value.trim();
                    const date = eventDateInput.value;

                    if (!name || !date) {
                        Toast.show('Please fill in all event details.', 'error');
                        return;
                    }

                    try {
                        await StudySync.addGroupEvent(name, date);
                        eventNameInput.value = '';
                        eventDateInput.value = '';
                    } catch (error) {
                        console.error('Error in group event form submission:', error);
                        Toast.show('Failed to add event. Please try again.', 'error');
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing app:', error);
            Toast.show('Failed to initialize application', 'error');
        }
    }

    static async initializeEventListeners() {
        // Mobile menu events
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);

        // Navigation events
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                showSection(section);
                if (state.isMobileMenuOpen) toggleMobileMenu();
                eventEmitter.dispatch(EVENTS.SECTION_CHANGE, { section });
            });
        });

        // Comment form events
        commentForm.addEventListener('submit', (e) => CommentsManager.handleSubmission(e));

        // Custom event subscriptions
        eventEmitter.subscribe(EVENTS.SECTION_CHANGE, ({ detail }) => {
            localStorage.setItem('currentSection', detail.section);
        });

        eventEmitter.subscribe(EVENTS.MENU_TOGGLE, ({ detail }) => {
            document.body.classList.toggle('menu-open', detail.isOpen);
        });

        eventEmitter.subscribe(EVENTS.COMMENT_ADDED, async () => {
            await CommentsManager.loadComments();
        });
    }
}

// MindMesh object for visual brainstorming
const MindMesh = {
    nodes: [],
    edges: [],
    selectedNode: null,
    p5Instance: null,

    setup() {
        const canvasContainer = document.getElementById('mindMeshCanvas');
        if (!canvasContainer) return;

        // Load saved nodes
        this.loadNodes();

        // Create p5 instance
        this.p5Instance = new p5((p) => {
            p.setup = () => {
                const canvas = p.createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
                canvas.parent('mindMeshCanvas');
                p.background(255);
                this.drawNodes(p);
            };

            p.draw = () => {
                p.background(255);
                this.drawEdges(p);
                this.drawNodes(p);
            };

            p.mousePressed = () => {
                if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return;

                const clickedNode = this.findClickedNode(p.mouseX, p.mouseY);
                if (clickedNode) {
                    if (this.selectedNode && this.selectedNode !== clickedNode) {
                        this.addEdge(this.selectedNode, clickedNode);
                        this.selectedNode = null;
                    } else {
                        this.selectedNode = clickedNode;
                    }
                } else {
                    this.addNode(p.mouseX, p.mouseY);
                    this.selectedNode = null;
                }
                this.saveNodes();
            };

            p.windowResized = () => {
                p.resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
            };
        });

        // Initialize buttons
        const clearBtn = document.getElementById('clearCanvas');
        const saveBtn = document.getElementById('saveCanvas');

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCanvas();
                Toast.show('Canvas cleared');
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveNodes();
                Toast.show('Mind map saved');
            });
        }
    },

    addNode(x, y) {
        const node = {
            x,
            y,
            id: Date.now(),
            radius: 20
        };
        this.nodes.push(node);
    },

    addEdge(node1, node2) {
        const edge = {
            from: node1.id,
            to: node2.id
        };
        this.edges.push(edge);
    },

    findClickedNode(x, y) {
        return this.nodes.find(node => {
            const d = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            return d < node.radius;
        });
    },

    drawNodes(p) {
        this.nodes.forEach(node => {
            p.noStroke();
            if (node === this.selectedNode) {
                p.fill(66, 135, 245); // Blue when selected
            } else {
                p.fill(100);
            }
            p.circle(node.x, node.y, node.radius * 2);
        });
    },

    drawEdges(p) {
        p.stroke(150);
        p.strokeWeight(2);
        this.edges.forEach(edge => {
            const fromNode = this.nodes.find(n => n.id === edge.from);
            const toNode = this.nodes.find(n => n.id === edge.to);
            if (fromNode && toNode) {
                p.line(fromNode.x, fromNode.y, toNode.x, toNode.y);
            }
        });
    },

    clearCanvas() {
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        localStorage.removeItem('mindMeshNodes');
        localStorage.removeItem('mindMeshEdges');
        if (this.p5Instance) {
            this.p5Instance.background(255);
        }
    },

    saveNodes() {
        try {
            localStorage.setItem('mindMeshNodes', JSON.stringify(this.nodes));
            localStorage.setItem('mindMeshEdges', JSON.stringify(this.edges));
        } catch (error) {
            console.error('Error saving mind map:', error);
            Toast.show('Failed to save mind map', 'error');
        }
    },

    loadNodes() {
        try {
            const savedNodes = localStorage.getItem('mindMeshNodes');
            const savedEdges = localStorage.getItem('mindMeshEdges');
            if (savedNodes) this.nodes = JSON.parse(savedNodes);
            if (savedEdges) this.edges = JSON.parse(savedEdges);
        } catch (error) {
            console.error('Error loading mind map:', error);
            Toast.show('Failed to load mind map', 'error');
        }
    }
};

// Timetable Creator object for managing weekly schedule
const Timetable = {
    addSchedule: async function(subject, day, time, duration) {
        try {
            const schedule = this.getSchedule();
            const newEntry = {
                id: Date.now(),
                subject,
                day,
                time,
                duration
            };

            // Check for time conflicts
            const conflict = this.checkTimeConflict(newEntry, schedule);
            if (conflict) {
                Toast.show('Time slot conflicts with existing schedule', 'error');
                return false;
            }

            schedule.push(newEntry);
            schedule.sort((a, b) => {
                const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                if (dayDiff !== 0) return dayDiff;
                return a.time.localeCompare(b.time);
            });

            localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
            await this.displaySchedule();
            Toast.show('Schedule added successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Error adding schedule:', error);
            Toast.show('Failed to add schedule', 'error');
            return false;
        }
    },

    getSchedule: function() {
        try {
            const schedule = localStorage.getItem('weeklySchedule');
            return schedule ? JSON.parse(schedule) : [];
        } catch (error) {
            console.error('Error getting schedule:', error);
            return [];
        }
    },

    deleteSchedule: async function(id) {
        try {
            let schedule = this.getSchedule();
            schedule = schedule.filter(entry => entry.id !== id);
            localStorage.setItem('weeklySchedule', JSON.stringify(schedule));
            await this.displaySchedule();
            Toast.show('Schedule deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            Toast.show('Failed to delete schedule', 'error');
        }
    },

    checkTimeConflict: function(newEntry, schedule) {
        const newStartTime = this.timeToMinutes(newEntry.time);
        const newEndTime = newStartTime + parseInt(newEntry.duration);

        return schedule.some(entry => {
            if (entry.day !== newEntry.day) return false;

            const existingStartTime = this.timeToMinutes(entry.time);
            const existingEndTime = existingStartTime + parseInt(entry.duration);

            return (newStartTime < existingEndTime && newEndTime > existingStartTime);
        });
    },

    timeToMinutes: function(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    },

    formatTime: function(time, duration) {
        const startTime = new Date(`2000-01-01T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60000);
        return `${time} - ${endTime.toTimeString().slice(0, 5)}`;
    },

    displaySchedule: async function() {
        try {
            const timetableDisplay = document.getElementById('timetableDisplay');
            if (!timetableDisplay) return;

            const schedule = this.getSchedule();
            const groupedByDay = schedule.reduce((acc, entry) => {
                if (!acc[entry.day]) acc[entry.day] = [];
                acc[entry.day].push(entry);
                return acc;
            }, {});

            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            timetableDisplay.innerHTML = days.map(day => {
                const daySchedule = groupedByDay[day] || [];
                if (daySchedule.length === 0) return '';

                return `
                    <div class="bg-white p-4 rounded-lg shadow-md">
                        <h4 class="text-lg font-semibold text-gray-800 mb-3">${day}</h4>
                        <div class="space-y-2">
                            ${daySchedule.map(entry => `
                                <div class="flex justify-between items-center py-2 border-b last:border-0">
                                    <div>
                                        <p class="font-medium text-gray-800">${escapeHtml(entry.subject)}</p>
                                        <p class="text-sm text-gray-600">${this.formatTime(entry.time, entry.duration)}</p>
                                    </div>
                                    <button onclick="Timetable.deleteSchedule(${entry.id})"
                                            class="text-red-500 hover:text-red-600 transition-colors"
                                            aria-label="Delete schedule">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).filter(Boolean).join('');
        } catch (error) {
            console.error('Error displaying schedule:', error);
            Toast.show('Failed to display schedule', 'error');
        }
    }
};

// CheatNotes object for managing study notes
const CheatNotes = {
    saveNote: async function(title, content) {
        try {
            const notes = this.getNotes();
            const newNote = {
                id: Date.now(),
                title,
                content,
                timestamp: new Date().toISOString()
            };
            notes.unshift(newNote);
            localStorage.setItem('cheatNotes', JSON.stringify(notes));
            await this.displayNotes();
            Toast.show('Note saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving note:', error);
            Toast.show('Failed to save note', 'error');
        }
    },

    getNotes: function() {
        try {
            const notes = localStorage.getItem('cheatNotes');
            return notes ? JSON.parse(notes) : [];
        } catch (error) {
            console.error('Error getting notes:', error);
            return [];
        }
    },

    deleteNote: async function(id) {
        try {
            let notes = this.getNotes();
            notes = notes.filter(note => note.id !== id);
            localStorage.setItem('cheatNotes', JSON.stringify(notes));
            await this.displayNotes();
            Toast.show('Note deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting note:', error);
            Toast.show('Failed to delete note', 'error');
        }
    },

    displayNotes: async function() {
        try {
            const notesDisplay = document.getElementById('notesDisplay');
            if (!notesDisplay) return;

            const notes = this.getNotes();
            notesDisplay.innerHTML = notes.map(note => `
                <div class="bg-white p-4 rounded-lg shadow-md" role="listitem">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="text-lg font-semibold text-gray-800">${escapeHtml(note.title)}</h4>
                        <button onclick="CheatNotes.deleteNote(${note.id})"
                                class="text-red-500 hover:text-red-600 transition-colors"
                                aria-label="Delete note">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                    <p class="text-gray-600 whitespace-pre-wrap">${escapeHtml(note.content)}</p>
                    <p class="text-sm text-gray-500 mt-2">${formatDate(new Date(note.timestamp))}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error displaying notes:', error);
            Toast.show('Failed to display notes', 'error');
        }
    }
};

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Initialize CheatNotes form
    const noteForm = document.getElementById('noteForm');
    if (noteForm) {
        noteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const titleInput = document.getElementById('noteTitle');
            const contentInput = document.getElementById('noteContent');
            
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();

            if (!title || !content) {
                Toast.show('Please fill in both title and content', 'error');
                return;
            }

            await CheatNotes.saveNote(title, content);
            titleInput.value = '';
            contentInput.value = '';
        });
    }

    // Initialize Timetable form
    const scheduleForm = document.getElementById('scheduleForm');
    if (scheduleForm) {
        scheduleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const subjectInput = document.getElementById('subjectName');
            const dayInput = document.getElementById('dayOfWeek');
            const timeInput = document.getElementById('timeSlot');
            const durationInput = document.getElementById('duration');
            
            const subject = subjectInput.value.trim();
            const day = dayInput.value;
            const time = timeInput.value;
            const duration = durationInput.value;

            if (!subject || !day || !time || !duration) {
                Toast.show('Please fill in all schedule details', 'error');
                return;
            }

            const success = await Timetable.addSchedule(subject, day, time, parseInt(duration));
            if (success) {
                subjectInput.value = '';
                dayInput.value = '';
                timeInput.value = '';
                durationInput.value = '';
            }
        });
    }

    // Handle Syllabus form submission
    const syllabusForm = document.getElementById('syllabusForm');
    if (syllabusForm) {
        syllabusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const topic = syllabusForm.querySelector('#topicName').value;
            const subject = syllabusForm.querySelector('#subjectArea').value;
            const startDate = syllabusForm.querySelector('#startDate').value;
            const endDate = syllabusForm.querySelector('#endDate').value;
            const priority = syllabusForm.querySelector('#priority').value;
            const notes = syllabusForm.querySelector('#notes').value;

            if (!topic || !subject || !startDate || !endDate || !priority) {
                Toast.show('Please fill in all required fields', 'error');
                return;
            }

            if (new Date(startDate) > new Date(endDate)) {
                Toast.show('Start date must be before end date', 'error');
                return;
            }

            const success = await Syllabus.addTopic(topic, subject, startDate, endDate, priority, notes);
            if (success) {
                syllabusForm.reset();
            }
        });
    }

    // Handle Syllabus sorting
    const sortByDateBtn = document.getElementById('sortByDate');
    const sortByPriorityBtn = document.getElementById('sortByPriority');

    if (sortByDateBtn) {
        sortByDateBtn.addEventListener('click', () => Syllabus.displayTopics('date'));
    }
    if (sortByPriorityBtn) {
        sortByPriorityBtn.addEventListener('click', () => Syllabus.displayTopics('priority'));
    }

    // Display existing notes, schedule, and syllabus
    CheatNotes.displayNotes();
    Timetable.displaySchedule();
    Syllabus.displayTopics();
});

function showSection(sectionId) {
    state.currentSection = sectionId;
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.remove('hidden');
            section.setAttribute('aria-hidden', 'false');
        } else {
            section.classList.add('hidden');
            section.setAttribute('aria-hidden', 'true');
        }
    });
    updateActiveNavLink(sectionId);
}

function updateActiveNavLink(sectionId) {
    navLinks.forEach(link => {
        const section = link.getAttribute('data-section');
        if (section === sectionId) {
            link.classList.add('active', 'text-blue-600');
            link.setAttribute('aria-current', 'page');
        } else {
            link.classList.remove('active', 'text-blue-600');
            link.removeAttribute('aria-current');
        }
    });
}

// Mobile menu functionality
function initializeMobileMenu() {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && state.isMobileMenuOpen) {
            toggleMobileMenu();
        }
    });
}

function toggleMobileMenu() {
    state.isMobileMenuOpen = !state.isMobileMenuOpen;
    mobileMenu.classList.toggle('show');
    mobileMenuBtn.setAttribute('aria-expanded', state.isMobileMenuOpen);
    mobileMenu.setAttribute('aria-hidden', !state.isMobileMenuOpen);
    
    // Update button icon
    const icon = mobileMenuBtn.querySelector('svg');
    icon.innerHTML = state.isMobileMenuOpen
        ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
        : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>';
}

// Scroll-aware header
function initializeScrollHeader() {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
}

function handleScroll() {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        if (currentScroll > state.lastScrollPosition) {
            header.classList.add('header-scroll');
        } else {
            header.classList.remove('header-scroll');
        }
    } else {
        header.classList.remove('header-scroll');
    }
    state.lastScrollPosition = currentScroll;
}

// Comments functionality
function initializeComments() {
    loadComments();
    commentForm.addEventListener('submit', handleCommentSubmission);
}

// Comments management
const CommentsManager = {
    async handleSubmission(e) {
        e.preventDefault();
        const textarea = commentForm.querySelector('textarea');
        const comment = textarea.value.trim();

        if (!comment) {
            Toast.show('Please enter a comment', 'error');
            return;
        }

        try {
            state.isLoading = true;
            await this.addComment(comment);
            textarea.value = '';
            Toast.show('Comment added successfully!');
            eventEmitter.dispatch(EVENTS.COMMENT_ADDED, { id: Date.now() });
        } catch (error) {
            console.error('Error adding comment:', error);
            Toast.show('Failed to add comment. Please try again.', 'error');
        } finally {
            state.isLoading = false;
        }
    },

    async addComment(text) {
        const comments = await this.getComments();
        const newComment = {
            id: Date.now(),
            text,
            timestamp: new Date().toISOString()
        };

        comments.push(newComment);
        await this.saveComments(comments);
        await this.renderComments();
    },

    async getComments() {
        try {
            const saved = localStorage.getItem('comments');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error reading comments:', error);
            return [];
        }
    },

    async saveComments(comments) {
        try {
            localStorage.setItem('comments', JSON.stringify(comments));
        } catch (error) {
            console.error('Error saving comments:', error);
            throw new Error('Failed to save comments');
        }
    },

    async loadComments() {
        try {
            await this.renderComments();
        } catch (error) {
            console.error('Error loading comments:', error);
            Toast.show('Failed to load comments', 'error');
        }
    },

    async renderComments() {
        const comments = await this.getComments();
        
        if (comments.length === 0) {
            commentsContainer.innerHTML = '<p class="text-gray-500 text-center" role="status">No comments yet. Be the first to comment!</p>';
            return;
        }

        commentsContainer.innerHTML = comments.map(comment => `
            <div class="bg-white p-4 rounded-lg shadow mb-4" role="article">
                <p class="text-gray-800 mb-2">${escapeHtml(comment.text)}</p>
                <time class="text-sm text-gray-500" datetime="${comment.timestamp}">
                    ${formatDate(comment.timestamp)}
                </time>
            </div>
        `).join('');
    }
};

// Utility functions
// Toast notification utility
const Toast = {
    create(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'bg-red-50' : 'bg-green-50'}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        return toast;
    },

    show(message, type = 'success') {
        if (this.activeToast) {
            this.activeToast.remove();
        }

        const toast = this.create(message, type);
        document.body.appendChild(toast);
        this.activeToast = toast;

        // Force reflow
        toast.offsetHeight;

        requestAnimationFrame(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    toast.remove();
                    this.activeToast = null;
                }, CONFIG.TOAST_FADE_DURATION);
            }, CONFIG.TOAST_DURATION);
        });
    }
};

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}