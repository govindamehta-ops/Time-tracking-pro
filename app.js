class OnboardingManager {
    constructor(app) {
        this.app = app;
        this.currentStep = 0;
        this.totalSteps = 4;
        this.currentTourStep = 0;
        this.achievements = [];
        this.isOnboardingActive = false;
        
        // Onboarding data from the provided JSON
        this.tourStops = [
            {
                target: "#dashboard",
                title: "Your Dashboard",
                description: "Your central hub showing today's status, weekly hours, and important notifications at a glance.",
                position: "bottom"
            },
            {
                target: "#clock-toggle",
                title: "Clock In/Out",
                description: "Easily track your work hours with our one-click clock in and out system.",
                position: "top"
            },
            {
                target: "#globalSearch",
                title: "Global Search",
                description: "Quickly find employees, projects, reports, and more using our powerful search feature.",
                position: "bottom"
            },
            {
                target: "#themeToggle",
                title: "Theme Toggle",
                description: "Switch between light and dark modes to match your preference and lighting conditions.",
                position: "bottom"
            },
            {
                target: ".nav-link[data-view='time-tracking']",
                title: "Time Tracking",
                description: "View your timesheets, track project hours, and manage your work schedule.",
                position: "right"
            },
            {
                target: ".nav-link[data-view='attendance']",
                title: "Attendance & Leave",
                description: "Request time off, view your attendance history, and check your leave balance.",
                position: "right"
            },
            {
                target: ".nav-link[data-view='reports']",
                title: "Reports",
                description: "Generate detailed reports on your work hours, productivity, and attendance patterns.",
                position: "right"
            },
            {
                target: ".nav-link[data-view='team']",
                title: "Team Overview",
                description: "View team status, collaborate on projects, and stay connected with colleagues.",
                position: "right"
            }
        ];
        
        this.achievementTypes = {
            'first-clock-in': { title: 'Time Tracker', description: 'Successfully clocked in for the first time', icon: '⏰' },
            'first-search': { title: 'Search Master', description: 'Used the global search feature', icon: '🔍' },
            'theme-switcher': { title: 'Style Setter', description: 'Switched between light and dark themes', icon: '🎨' },
            'leave-requester': { title: 'Vacation Planner', description: 'Submitted your first leave request', icon: '🏖️' },
            'report-generator': { title: 'Data Analyst', description: 'Generated your first report', icon: '📊' },
            'onboarding-complete': { title: 'TimeTracker Pro Expert', description: 'Completed the full onboarding experience', icon: '🎓' }
        };
        
        this.init();
    }
    
    init() {
        this.bindOnboardingEvents();
        this.bindKeyboardShortcuts();
    }
    
    bindOnboardingEvents() {
        // Welcome screen events
        const startBtn = document.getElementById('startOnboardingBtn');
        const skipBtn = document.getElementById('skipOnboardingBtn');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startOnboarding());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipOnboarding());
        }
        
        // Setup wizard events
        const setupNextBtn = document.getElementById('setupNextBtn');
        const setupPrevBtn = document.getElementById('setupPrevBtn');
        const setupCompleteBtn = document.getElementById('setupCompleteBtn');
        
        if (setupNextBtn) {
            setupNextBtn.addEventListener('click', () => this.nextSetupStep());
        }
        
        if (setupPrevBtn) {
            setupPrevBtn.addEventListener('click', () => this.prevSetupStep());
        }
        
        if (setupCompleteBtn) {
            setupCompleteBtn.addEventListener('click', () => this.completeSetup());
        }
        
        // Role card selection
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', () => this.selectRole(card));
        });
        
        // Tour events
        const tourNextBtn = document.getElementById('tourNextBtn');
        const tourPrevBtn = document.getElementById('tourPrevBtn');
        const tourSkipBtn = document.getElementById('tourSkipBtn');
        const tourTryBtn = document.getElementById('tourTryBtn');
        
        if (tourNextBtn) {
            tourNextBtn.addEventListener('click', () => this.nextTourStep());
        }
        
        if (tourPrevBtn) {
            tourPrevBtn.addEventListener('click', () => this.prevTourStep());
        }
        
        if (tourSkipBtn) {
            tourSkipBtn.addEventListener('click', () => this.skipTour());
        }
        
        if (tourTryBtn) {
            tourTryBtn.addEventListener('click', () => this.tryFeature());
        }
        
        // Achievement events
        const achievementCloseBtn = document.getElementById('achievementCloseBtn');
        if (achievementCloseBtn) {
            achievementCloseBtn.addEventListener('click', () => this.closeAchievement());
        }
        
        // Help center events
        const showShortcutsBtn = document.getElementById('showShortcutsBtn');
        const completeOnboardingBtn = document.getElementById('completeOnboardingBtn');
        const showHelpBtn = document.getElementById('showHelpBtn');
        
        if (showShortcutsBtn) {
            showShortcutsBtn.addEventListener('click', () => this.toggleShortcuts());
        }
        
        if (completeOnboardingBtn) {
            completeOnboardingBtn.addEventListener('click', () => this.completeOnboarding());
        }
        
        if (showHelpBtn) {
            showHelpBtn.addEventListener('click', () => this.showHelpCenter());
        }
        
        // Track achievements
        this.trackUserActions();
    }
    
    bindKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Space bar for clock toggle
            if (e.code === 'Space' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.app.toggleClock();
                this.checkAchievement('first-clock-in');
            }
            
            // Ctrl+D for dashboard
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.app.showSection('dashboard');
            }
            
            // Ctrl+T for time tracking
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.app.showSection('timetracking');
            }
            
            // Ctrl+A for attendance
            if (e.ctrlKey && e.key === 'a') {
                e.preventDefault();
                this.app.showSection('attendance');
            }
            
            // Ctrl+R for reports
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.app.showSection('reports');
            }
            
            // ? for help
            if (e.key === '?' && !e.target.matches('input, textarea, select')) {
                e.preventDefault();
                this.showHelpCenter();
            }
            
            // Escape to close modals/overlays
            if (e.key === 'Escape') {
                this.closeCurrentOverlay();
            }
        });
    }
    
    checkFirstTimeLogin() {
        if (this.app.currentUser && this.app.currentUser.isFirstLogin) {
            this.showWelcomeScreen();
        }
    }
    
    showWelcomeScreen() {
        const overlay = document.getElementById('onboardingOverlay');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const welcomeMessage = document.getElementById('welcomeMessage');
        
        // Customize welcome message based on user role
        if (this.app.currentUser) {
            const role = this.app.currentUser.role;
            const name = this.app.currentUser.name.split(' ')[0];
            
            let message = `Welcome to TimeTracker Pro, ${name}!`;
            
            if (role === 'Admin') {
                message = `Welcome back, Administrator ${name}!`;
            } else if (role === 'Manager') {
                message = `Welcome, Manager ${name}!`;
            }
            
            welcomeMessage.textContent = message;
        }
        
        overlay.classList.remove('hidden');
        welcomeScreen.classList.remove('hidden');
        this.isOnboardingActive = true;
    }
    
    startOnboarding() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const setupWizard = document.getElementById('setupWizard');
        
        welcomeScreen.classList.add('hidden');
        setupWizard.classList.remove('hidden');
        
        this.currentStep = 1;
        this.updateSetupProgress();
        this.populateUserInfo();
    }
    
    skipOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        overlay.classList.add('hidden');
        this.isOnboardingActive = false;
        this.app.showToast('You can access onboarding help anytime from the user menu', 'info');
    }
    
    populateUserInfo() {
        const setupName = document.getElementById('setupName');
        const setupDepartment = document.getElementById('setupDepartment');
        
        if (this.app.currentUser && setupName && setupDepartment) {
            setupName.value = this.app.currentUser.name;
            setupDepartment.value = this.app.currentUser.department;
        }
    }
    
    nextSetupStep() {
        if (this.currentStep < this.totalSteps) {
            const currentStepEl = document.getElementById(`setupStep${this.currentStep}`);
            currentStepEl.classList.remove('active');
            
            this.currentStep++;
            
            const nextStepEl = document.getElementById(`setupStep${this.currentStep}`);
            nextStepEl.classList.add('active');
            
            this.updateSetupProgress();
            this.updateSetupButtons();
        }
    }
    
    prevSetupStep() {
        if (this.currentStep > 1) {
            const currentStepEl = document.getElementById(`setupStep${this.currentStep}`);
            currentStepEl.classList.remove('active');
            
            this.currentStep--;
            
            const prevStepEl = document.getElementById(`setupStep${this.currentStep}`);
            prevStepEl.classList.add('active');
            
            this.updateSetupProgress();
            this.updateSetupButtons();
        }
    }
    
    updateSetupProgress() {
        const stepCounter = document.getElementById('stepCounter');
        const progressFill = document.getElementById('progressFill');
        
        if (stepCounter) {
            stepCounter.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
        
        if (progressFill) {
            const percentage = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${percentage}%`;
        }
    }
    
    updateSetupButtons() {
        const prevBtn = document.getElementById('setupPrevBtn');
        const nextBtn = document.getElementById('setupNextBtn');
        const completeBtn = document.getElementById('setupCompleteBtn');
        
        if (prevBtn) {
            prevBtn.style.visibility = this.currentStep > 1 ? 'visible' : 'hidden';
        }
        
        if (this.currentStep === this.totalSteps) {
            nextBtn.classList.add('hidden');
            completeBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            completeBtn.classList.add('hidden');
        }
    }
    
    selectRole(card) {
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        
        const role = card.dataset.role;
        if (this.app.currentUser) {
            this.app.currentUser.role = role.charAt(0).toUpperCase() + role.slice(1);
        }
    }
    
    completeSetup() {
        const setupWizard = document.getElementById('setupWizard');
        const interactiveTour = document.getElementById('interactiveTour');
        
        setupWizard.classList.add('hidden');
        interactiveTour.classList.remove('hidden');
        
        this.startInteractiveTour();
    }
    
    startInteractiveTour() {
        this.currentTourStep = 0;
        this.showTourStep();
    }
    
    showTourStep() {
        const tourStop = this.tourStops[this.currentTourStep];
        if (!tourStop) return;
        
        const target = document.querySelector(tourStop.target);
        if (!target) {
            this.nextTourStep();
            return;
        }
        
        const spotlight = document.querySelector('.tour-spotlight');
        const tooltip = document.querySelector('.tour-tooltip');
        const title = document.getElementById('tourTitle');
        const description = document.getElementById('tourDescription');
        const counter = document.getElementById('tourCounter');
        const progressFill = document.getElementById('tourProgressFill');
        const prevBtn = document.getElementById('tourPrevBtn');
        const nextBtn = document.getElementById('tourNextBtn');
        const tryBtn = document.getElementById('tourTryBtn');
        
        // Position spotlight
        const rect = target.getBoundingClientRect();
        spotlight.style.left = `${rect.left - 5}px`;
        spotlight.style.top = `${rect.top - 5}px`;
        spotlight.style.width = `${rect.width + 10}px`;
        spotlight.style.height = `${rect.height + 10}px`;
        
        // Position tooltip
        let tooltipTop = rect.top + rect.height + 20;
        let tooltipLeft = rect.left;
        
        if (tourStop.position === 'top') {
            tooltipTop = rect.top - 200;
        } else if (tourStop.position === 'right') {
            tooltipLeft = rect.right + 20;
            tooltipTop = rect.top;
        } else if (tourStop.position === 'left') {
            tooltipLeft = rect.left - 340;
            tooltipTop = rect.top;
        }
        
        // Ensure tooltip stays in viewport
        const maxLeft = window.innerWidth - 340;
        const maxTop = window.innerHeight - 200;
        tooltipLeft = Math.min(tooltipLeft, maxLeft);
        tooltipTop = Math.min(tooltipTop, maxTop);
        tooltipLeft = Math.max(tooltipLeft, 20);
        tooltipTop = Math.max(tooltipTop, 20);
        
        tooltip.style.left = `${tooltipLeft}px`;
        tooltip.style.top = `${tooltipTop}px`;
        
        // Update content
        title.textContent = tourStop.title;
        description.textContent = tourStop.description;
        counter.textContent = `${this.currentTourStep + 1} of ${this.tourStops.length}`;
        
        const percentage = ((this.currentTourStep + 1) / this.tourStops.length) * 100;
        progressFill.style.width = `${percentage}%`;
        
        // Update buttons
        prevBtn.style.display = this.currentTourStep > 0 ? 'inline-flex' : 'none';
        
        // Show try button for interactive elements
        const isInteractive = ['#clock-toggle', '#globalSearch', '#themeToggle'].includes(tourStop.target);
        if (isInteractive) {
            nextBtn.classList.add('hidden');
            tryBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            tryBtn.classList.add('hidden');
        }
        
        // Add pulse effect to target
        target.classList.add('tour-target');
    }
    
    nextTourStep() {
        this.removeTourTarget();
        
        if (this.currentTourStep < this.tourStops.length - 1) {
            this.currentTourStep++;
            this.showTourStep();
        } else {
            this.completeTour();
        }
    }
    
    prevTourStep() {
        this.removeTourTarget();
        
        if (this.currentTourStep > 0) {
            this.currentTourStep--;
            this.showTourStep();
        }
    }
    
    skipTour() {
        this.removeTourTarget();
        this.completeTour();
    }
    
    tryFeature() {
        const tourStop = this.tourStops[this.currentTourStep];
        const target = document.querySelector(tourStop.target);
        
        if (target) {
            if (tourStop.target === '#clock-toggle') {
                target.click();
                this.checkAchievement('first-clock-in');
            } else if (tourStop.target === '#globalSearch') {
                target.focus();
                target.value = 'Search demo';
                setTimeout(() => {
                    target.value = '';
                    this.checkAchievement('first-search');
                }, 1000);
            } else if (tourStop.target === '#themeToggle') {
                target.click();
                this.checkAchievement('theme-switcher');
            }
            
            setTimeout(() => {
                this.nextTourStep();
            }, 1500);
        }
    }
    
    removeTourTarget() {
        const targets = document.querySelectorAll('.tour-target');
        targets.forEach(target => target.classList.remove('tour-target'));
    }
    
    completeTour() {
        const interactiveTour = document.getElementById('interactiveTour');
        const helpCenter = document.getElementById('helpCenter');
        
        interactiveTour.classList.add('hidden');
        helpCenter.classList.remove('hidden');
        
        this.removeTourTarget();
    }
    
    showHelpCenter() {
        const overlay = document.getElementById('onboardingOverlay');
        const helpCenter = document.getElementById('helpCenter');
        
        // Hide all other screens
        const screens = overlay.querySelectorAll('.onboarding-screen');
        screens.forEach(screen => screen.classList.add('hidden'));
        
        overlay.classList.remove('hidden');
        helpCenter.classList.remove('hidden');
        this.isOnboardingActive = true;
    }
    
    toggleShortcuts() {
        const shortcuts = document.getElementById('keyboardShortcuts');
        if (shortcuts.style.display === 'none' || !shortcuts.style.display) {
            shortcuts.style.display = 'block';
        } else {
            shortcuts.style.display = 'none';
        }
    }
    
    completeOnboarding() {
        const overlay = document.getElementById('onboardingOverlay');
        overlay.classList.add('hidden');
        this.isOnboardingActive = false;
        
        // Mark user as having completed onboarding
        if (this.app.currentUser) {
            this.app.currentUser.isFirstLogin = false;
        }
        
        // Show completion achievement
        this.showAchievement('onboarding-complete');
    }
    
    trackUserActions() {
        // Track search usage
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', () => {
                if (globalSearch.value.length > 0) {
                    this.checkAchievement('first-search');
                }
            });
        }
        
        // Track theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.checkAchievement('theme-switcher');
            });
        }
        
        // Track leave requests
        const leaveRequestForm = document.getElementById('leaveRequestForm');
        if (leaveRequestForm) {
            leaveRequestForm.addEventListener('submit', () => {
                this.checkAchievement('leave-requester');
            });
        }
        
        // Track report generation
        const reportForm = document.getElementById('reportForm');
        if (reportForm) {
            reportForm.addEventListener('submit', () => {
                this.checkAchievement('report-generator');
            });
        }
    }
    
    checkAchievement(type) {
        if (!this.achievements.includes(type) && this.achievementTypes[type]) {
            this.achievements.push(type);
            this.showAchievement(type);
        }
    }
    
    showAchievement(type) {
        const achievement = this.achievementTypes[type];
        if (!achievement) return;
        
        const modal = document.getElementById('achievementModal');
        const icon = document.getElementById('achievementIcon');
        const title = document.getElementById('achievementTitle');
        const description = document.getElementById('achievementDescription');
        
        icon.textContent = achievement.icon;
        title.textContent = achievement.title;
        description.textContent = achievement.description;
        
        modal.classList.remove('hidden');
        
        // Auto-close after 3 seconds if not manually closed
        setTimeout(() => {
            if (!modal.classList.contains('hidden')) {
                this.closeAchievement();
            }
        }, 3000);
    }
    
    closeAchievement() {
        const modal = document.getElementById('achievementModal');
        modal.classList.add('hidden');
    }
    
    closeCurrentOverlay() {
        if (this.isOnboardingActive) {
            const overlay = document.getElementById('onboardingOverlay');
            overlay.classList.add('hidden');
            this.isOnboardingActive = false;
        }
        
        const achievementModal = document.getElementById('achievementModal');
        if (!achievementModal.classList.contains('hidden')) {
            this.closeAchievement();
        }
    }
}

class TimeTrackerApp {
    constructor() {
        this.currentUser = null;
        this.clockedIn = false;
        this.clockInTime = null;
        this.currentSection = 'dashboard';
        this.sidebarOpen = false;
        
        // Sample data with isFirstLogin flag
        this.users = [
            {"id": 1, "name": "John Smith", "email": "john.smith@company.com", "role": "Admin", "department": "IT", "status": "active", "isFirstLogin": true},
            {"id": 2, "name": "Sarah Johnson", "email": "sarah.johnson@company.com", "role": "Manager", "department": "HR", "status": "active", "isFirstLogin": true},
            {"id": 3, "name": "Mike Davis", "email": "mike.davis@company.com", "role": "Employee", "department": "Engineering", "status": "active", "isFirstLogin": true},
            {"id": 4, "name": "Lisa Chen", "email": "lisa.chen@company.com", "role": "Employee", "department": "Sales", "status": "active", "isFirstLogin": true},
            {"id": 5, "name": "David Wilson", "email": "david.wilson@company.com", "role": "Manager", "department": "Engineering", "status": "active", "isFirstLogin": true}
        ];
        
        this.timesheetData = [
            {"date": "Mon, Aug 4", "clockIn": "9:00 AM", "clockOut": "5:30 PM", "break": "1:00h", "total": "7.5h", "project": "Mobile App Dev", "status": "Approved"},
            {"date": "Tue, Aug 5", "clockIn": "8:45 AM", "clockOut": "5:15 PM", "break": "0:45h", "total": "7.75h", "project": "Mobile App Dev", "status": "Approved"},
            {"date": "Wed, Aug 6", "clockIn": "9:15 AM", "clockOut": "6:00 PM", "break": "1:15h", "total": "7.5h", "project": "Mobile App Dev", "status": "Approved"},
            {"date": "Thu, Aug 7", "clockIn": "8:30 AM", "clockOut": "4:45 PM", "break": "1:00h", "total": "7.25h", "project": "Mobile App Dev", "status": "Pending"},
            {"date": "Fri, Aug 8", "clockIn": "9:15 AM", "clockOut": "-", "break": "-", "total": "2.25h", "project": "Mobile App Dev", "status": "In Progress"}
        ];
        
        this.leaveRequests = [
            {"type": "Vacation", "startDate": "Aug 15, 2025", "endDate": "Aug 20, 2025", "days": 5, "status": "Pending"},
            {"type": "Sick Leave", "startDate": "Aug 10, 2025", "endDate": "Aug 12, 2025", "days": 3, "status": "Approved"}
        ];
        
        this.teamMembers = [
            {"name": "Mike Davis", "role": "Senior Developer", "avatar": "MD", "status": "Present", "hours": "8.75h"},
            {"name": "Lisa Chen", "role": "Sales Representative", "avatar": "LC", "status": "Present", "hours": "8.25h"},
            {"name": "David Wilson", "role": "Engineering Manager", "avatar": "DW", "status": "On Leave", "hours": "Sick Leave"}
        ];
        
        this.init();
    }
    
    init() {
        // Ensure DOM is loaded before binding events
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupApp());
        } else {
            this.setupApp();
        }
    }
    
    setupApp() {
        this.bindEvents();
        this.updateCurrentTime();
        this.initTheme();
        this.populateTimesheet();
        this.populateLeaveRequests();
        this.populateTeamMembers();
        this.setDefaultDates();
        
        // Initialize onboarding manager
        this.onboarding = new OnboardingManager(this);
        
        // Update time every second
        setInterval(() => this.updateCurrentTime(), 1000);
        setInterval(() => this.updateClockTime(), 1000);
    }
    
    bindEvents() {
        // Login form - Fixed event binding
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }
        
        // Navigation - Fixed event binding
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(e);
            });
        });
        
        // Menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Theme toggle - Fixed event binding
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // User menu
        const userMenuButton = document.getElementById('userMenuButton');
        const userDropdown = document.getElementById('userDropdown');
        const logoutButton = document.getElementById('logoutButton');
        
        if (userMenuButton) {
            userMenuButton.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('hidden');
            });
        }
        
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }
        
        // Clock in/out - Fixed event binding
        const clockButton = document.getElementById('clock-toggle');
        if (clockButton) {
            clockButton.addEventListener('click', () => this.toggleClock());
        }
        
        // Search functionality - Fixed event binding
        const globalSearch = document.getElementById('globalSearch');
        const searchBtn = document.querySelector('.search-btn');
        
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                if (e.target.value.length > 0) {
                    this.onboarding.checkAchievement('first-search');
                }
            });
            
            globalSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (globalSearch) {
                    this.performSearch(globalSearch.value);
                }
            });
        }
        
        // Leave request modal
        const newLeaveRequestBtn = document.getElementById('newLeaveRequestBtn');
        const leaveRequestModal = document.getElementById('leaveRequestModal');
        const closeLeaveModal = document.getElementById('closeLeaveModal');
        const cancelLeaveRequest = document.getElementById('cancelLeaveRequest');
        const leaveRequestForm = document.getElementById('leaveRequestForm');
        
        if (newLeaveRequestBtn) {
            newLeaveRequestBtn.addEventListener('click', () => {
                leaveRequestModal.classList.remove('hidden');
            });
        }
        
        if (closeLeaveModal) {
            closeLeaveModal.addEventListener('click', () => {
                leaveRequestModal.classList.add('hidden');
            });
        }
        
        if (cancelLeaveRequest) {
            cancelLeaveRequest.addEventListener('click', () => {
                leaveRequestModal.classList.add('hidden');
            });
        }
        
        if (leaveRequestForm) {
            leaveRequestForm.addEventListener('submit', (e) => this.handleLeaveRequest(e));
        }
        
        // Report form
        const reportForm = document.getElementById('reportForm');
        const exportReportBtn = document.getElementById('exportReportBtn');
        
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => this.handleReportGeneration(e));
        }
        
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                const userDropdown = document.getElementById('userDropdown');
                if (userDropdown) {
                    userDropdown.classList.add('hidden');
                }
            }
        });
        
        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (window.innerWidth <= 768 && 
                !e.target.closest('#sidebar') && 
                !e.target.closest('#menuToggle') &&
                sidebar && sidebar.classList.contains('open')) {
                this.closeSidebar();
            }
        });
        
        // Modal click outside to close
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }
    
    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        console.log('Login attempt:', email); // Debug log
        
        // Simple authentication - check if user exists and password is "password"
        const user = this.users.find(u => u.email === email);
        
        if (user && password === 'password') {
            this.currentUser = user;
            console.log('Login successful:', user); // Debug log
            
            // Use timeout to ensure DOM is ready
            setTimeout(() => {
                this.showApp();
                this.updateUserInfo();
                this.showToast('Login successful!', 'success');
                
                // Check if this is a first-time login
                this.onboarding.checkFirstTimeLogin();
            }, 100);
        } else {
            console.log('Login failed'); // Debug log
            this.showToast('Invalid email or password', 'error');
        }
    }
    
    handleLogout() {
        this.currentUser = null;
        this.clockedIn = false;
        this.clockInTime = null;
        this.hideApp();
        this.showToast('Logged out successfully', 'info');
        
        // Reset form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }
        
        // Hide any active onboarding
        const onboardingOverlay = document.getElementById('onboardingOverlay');
        if (onboardingOverlay) {
            onboardingOverlay.classList.add('hidden');
        }
    }
    
    showApp() {
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loginScreen && appContainer) {
            loginScreen.style.display = 'none';
            appContainer.style.display = 'flex';
            appContainer.classList.remove('hidden');
        }
    }
    
    hideApp() {
        const loginScreen = document.getElementById('loginScreen');
        const appContainer = document.getElementById('appContainer');
        
        if (loginScreen && appContainer) {
            loginScreen.style.display = 'flex';
            appContainer.style.display = 'none';
            appContainer.classList.add('hidden');
        }
    }
    
    updateUserInfo() {
        if (this.currentUser) {
            const currentUserName = document.getElementById('currentUserName');
            const userAvatar = document.getElementById('userAvatar');
            
            if (currentUserName) {
                currentUserName.textContent = this.currentUser.name;
            }
            
            if (userAvatar) {
                const initials = this.currentUser.name.split(' ')
                    .map(n => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                userAvatar.textContent = initials;
            }
        }
    }
    
    handleNavigation(e) {
        e.preventDefault();
        const button = e.target.closest('.nav-link');
        const section = button ? button.dataset.section : null;
        
        console.log('Navigation to:', section); // Debug log
        
        if (section) {
            this.showSection(section);
            this.closeSidebar();
        }
    }
    
    showSection(section) {
        console.log('Showing section:', section); // Debug log
        
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.remove('active'));
        
        // Show target section
        const targetSection = document.getElementById(`${section}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log('Section displayed:', section); // Debug log
        } else {
            console.error('Section not found:', `${section}Section`); // Debug log
        }
        
        // Update navigation
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === section) {
                link.classList.add('active');
            }
        });
        
        this.currentSection = section;
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && menuToggle) {
            if (sidebar.classList.contains('open')) {
                this.closeSidebar();
            } else {
                sidebar.classList.add('open');
                menuToggle.classList.add('active');
                this.sidebarOpen = true;
            }
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && menuToggle) {
            sidebar.classList.remove('open');
            menuToggle.classList.remove('active');
            this.sidebarOpen = false;
        }
    }
    
    toggleClock() {
        const clockButton = document.getElementById('clock-toggle');
        const clockStatus = document.getElementById('clockStatus');
        
        console.log('Clock toggle clicked'); // Debug log
        
        if (this.clockedIn) {
            // Clock out
            this.clockedIn = false;
            this.clockInTime = null;
            if (clockButton) clockButton.textContent = 'Clock In';
            if (clockStatus) clockStatus.innerHTML = '<span class="status--error">Clocked Out</span>';
            this.showToast('Clocked out successfully', 'success');
        } else {
            // Clock in
            this.clockedIn = true;
            this.clockInTime = new Date();
            if (clockButton) clockButton.textContent = 'Clock Out';
            if (clockStatus) clockStatus.innerHTML = '<span class="status--success">Clocked In</span>';
            this.showToast('Clocked in successfully', 'success');
            this.onboarding.checkAchievement('first-clock-in');
        }
        
        this.updateClockTime();
    }
    
    performSearch(query) {
        if (query.trim()) {
            this.showToast(`Searching for: "${query}"`, 'info');
            this.onboarding.checkAchievement('first-search');
        } else {
            this.showToast('Please enter a search term', 'warning');
        }
    }
    
    updateCurrentTime() {
        const currentTimeElement = document.getElementById('currentTime');
        if (currentTimeElement) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit'
            });
            currentTimeElement.textContent = timeString;
        }
    }
    
    updateClockTime() {
        const clockTimeElement = document.getElementById('clockTime');
        const todayHoursElement = document.getElementById('todayHours');
        
        if (this.clockedIn && this.clockInTime && clockTimeElement) {
            const now = new Date();
            const diff = now - this.clockInTime;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            clockTimeElement.textContent = timeString;
            
            const hoursWorked = (diff / (1000 * 60 * 60)).toFixed(1);
            if (todayHoursElement) {
                todayHoursElement.textContent = `${hoursWorked}h`;
            }
        } else if (clockTimeElement) {
            clockTimeElement.textContent = 'Ready to start';
            if (todayHoursElement) {
                todayHoursElement.textContent = '0.0h';
            }
        }
    }
    
    populateTimesheet() {
        const tbody = document.getElementById('timesheetTableBody');
        if (tbody) {
            tbody.innerHTML = this.timesheetData.map(row => `
                <tr>
                    <td>${row.date}</td>
                    <td>${row.clockIn}</td>
                    <td>${row.clockOut}</td>
                    <td>${row.break}</td>
                    <td>${row.total}</td>
                    <td>${row.project}</td>
                    <td><span class="status--${this.getStatusClass(row.status)}">${row.status}</span></td>
                </tr>
            `).join('');
        }
    }
    
    populateLeaveRequests() {
        const container = document.getElementById('leaveRequestsList');
        if (container) {
            container.innerHTML = this.leaveRequests.map(request => `
                <div class="leave-item">
                    <div class="leave-item-header">
                        <span class="leave-type">${request.type}</span>
                        <span class="status--${this.getStatusClass(request.status)}">${request.status}</span>
                    </div>
                    <div class="leave-dates">${request.startDate} - ${request.endDate} (${request.days} days)</div>
                </div>
            `).join('');
        }
    }
    
    populateTeamMembers() {
        const container = document.getElementById('teamMembersList');
        if (container) {
            container.innerHTML = this.teamMembers.map(member => `
                <div class="team-member">
                    <div class="team-member-avatar">${member.avatar}</div>
                    <div class="team-member-info">
                        <div class="team-member-name">${member.name}</div>
                        <div class="team-member-role">${member.role}</div>
                    </div>
                    <div class="team-member-status">
                        <div><span class="status--${this.getStatusClass(member.status)}">${member.status}</span></div>
                        <div class="team-member-hours">${member.hours}</div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'approved':
            case 'present':
                return 'success';
            case 'pending':
            case 'in progress':
                return 'warning';
            case 'rejected':
                return 'error';
            case 'on leave':
                return 'info';
            default:
                return 'info';
        }
    }
    
    handleLeaveRequest(e) {
        e.preventDefault();
        
        const leaveType = document.getElementById('leaveType').value;
        const startDate = document.getElementById('leaveStartDate').value;
        const endDate = document.getElementById('leaveEndDate').value;
        const reason = document.getElementById('leaveReason').value;
        
        if (!leaveType || !startDate || !endDate) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        // Calculate days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        
        // Add to leave requests
        const newRequest = {
            type: leaveType.charAt(0).toUpperCase() + leaveType.slice(1),
            startDate: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            endDate: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            days: diffDays,
            status: 'Pending'
        };
        
        this.leaveRequests.unshift(newRequest);
        this.populateLeaveRequests();
        
        // Close modal
        document.getElementById('leaveRequestModal').classList.add('hidden');
        const form = document.getElementById('leaveRequestForm');
        if (form) form.reset();
        
        this.showToast('Leave request submitted successfully', 'success');
        this.onboarding.checkAchievement('leave-requester');
    }
    
    handleReportGeneration(e) {
        e.preventDefault();
        
        const reportType = document.getElementById('reportType').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        
        if (!startDate || !endDate) {
            this.showToast('Please select date range', 'error');
            return;
        }
        
        const reportContent = document.getElementById('reportContent');
        if (reportContent) {
            const start = new Date(startDate).toLocaleDateString();
            const end = new Date(endDate).toLocaleDateString();
            
            let content = '';
            
            switch (reportType) {
                case 'attendance':
                    content = this.generateAttendanceReport(start, end);
                    break;
                case 'timesheet':
                    content = this.generateTimesheetReport(start, end);
                    break;
                case 'leave':
                    content = this.generateLeaveReport(start, end);
                    break;
            }
            
            reportContent.innerHTML = content;
        }
        
        this.showToast('Report generated successfully', 'success');
        this.onboarding.checkAchievement('report-generator');
    }
    
    generateAttendanceReport(startDate, endDate) {
        return `
            <h4>Attendance Summary Report</h4>
            <p><strong>Period:</strong> ${startDate} - ${endDate}</p>
            <div class="report-stats">
                <div class="stat">
                    <span class="stat-label">Total Working Days:</span>
                    <span class="stat-value">22</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Days Present:</span>
                    <span class="stat-value">20</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Days Absent:</span>
                    <span class="stat-value">2</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Attendance Rate:</span>
                    <span class="stat-value">90.9%</span>
                </div>
            </div>
        `;
    }
    
    generateTimesheetReport(startDate, endDate) {
        return `
            <h4>Timesheet Report</h4>
            <p><strong>Period:</strong> ${startDate} - ${endDate}</p>
            <div class="report-stats">
                <div class="stat">
                    <span class="stat-label">Total Hours:</span>
                    <span class="stat-value">160.5h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Regular Hours:</span>
                    <span class="stat-value">160h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Overtime:</span>
                    <span class="stat-value">0.5h</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Average Daily Hours:</span>
                    <span class="stat-value">8.0h</span>
                </div>
            </div>
        `;
    }
    
    generateLeaveReport(startDate, endDate) {
        return `
            <h4>Leave Summary Report</h4>
            <p><strong>Period:</strong> ${startDate} - ${endDate}</p>
            <div class="report-stats">
                <div class="stat">
                    <span class="stat-label">Vacation Days Used:</span>
                    <span class="stat-value">5</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Sick Days Used:</span>
                    <span class="stat-value">3</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Personal Days Used:</span>
                    <span class="stat-value">1</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Remaining Balance:</span>
                    <span class="stat-value">12 days</span>
                </div>
            </div>
        `;
    }
    
    exportReport() {
        this.showToast('Report export functionality would be implemented here', 'info');
    }
    
    setDefaultDates() {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        
        if (startDateInput && endDateInput) {
            const today = new Date();
            const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            
            startDateInput.value = oneMonthAgo.toISOString().split('T')[0];
            endDateInput.value = today.toISOString().split('T')[0];
        }
        
        // Set minimum date for leave requests to today
        const leaveStartDate = document.getElementById('leaveStartDate');
        const leaveEndDate = document.getElementById('leaveEndDate');
        
        if (leaveStartDate && leaveEndDate) {
            const today = new Date().toISOString().split('T')[0];
            leaveStartDate.min = today;
            leaveEndDate.min = today;
        }
    }
    
    initTheme() {
        // Check for saved theme preference or default to system preference
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let theme = systemPrefersDark ? 'dark' : 'light';
        this.applyTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            this.applyTheme(e.matches ? 'dark' : 'light');
        });
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        }
    }
    
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;
        toast.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; font-size: 18px; cursor: pointer; margin-left: 12px; color: var(--color-text-secondary);">&times;</button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TimeTrackerApp();
});