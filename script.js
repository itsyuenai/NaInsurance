// Naisya Yuen Ra'af - 535240187
let appData = {
    users: [
        { email: 'user@example.com', password: 'password123', name: 'Naisya Yuen', phone: '081234567890' }
    ],
    currentUser: null,
    purchaseHistory: []
};

let currentInsuranceType = null;
let currentTransaction = {};
let userToResetPassword = null;
const TODAY = new Date('2025-09-19');

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    updateAuthUI();
    initializeParallax();
    initializeScrollReveal();
    initializeHeader();
    startFloatingAnimation();
    initializeInteractions();
}

// Efek parallax
function initializeParallax() {
    window.addEventListener('scroll', handleParallax);
}

function handleParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('[data-speed]');

    parallaxElements.forEach(element => {
        const speed = element.dataset.speed;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });

    const floatingElements = document.querySelectorAll('.floating-element');
    floatingElements.forEach((element, index) => {
        const speed = 0.1 + (index * 0.05);
        const yPos = scrolled * speed;
        element.style.transform = `translateY(${yPos}px)`;
    });
}

function initializeScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// Header scroll
function initializeHeader() {
    const header = document.querySelector('.header-parallax');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Animasi
function startFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.floating-element');

    floatingElements.forEach((element, index) => {
        element.style.animationDelay = `${index * 0.5}s`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
    });
}

// Page management
function showPage(pageId) {
    const pages = [
        'homePage', 'loginPage', 'signupPage', 'detailPage', 'historyPage',
        'purchaseCarPage', 'purchaseHealthPage', 'purchaseLifePage',
        'checkoutPage', 'forgotPasswordPage', 'resetPasswordPage'
    ];

    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.classList.remove('active');
        }
    });

    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        setTimeout(() => {
            targetPage.classList.add('active');
        }, 50);
    }
    if (pageId === 'history' && appData.currentUser) {
        loadHistory();
    }
}

function scrollToProducts() {
    const homePage = document.getElementById('homePage');
    const productsSection = document.getElementById('products');

    if (homePage && homePage.classList.contains('active')) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    } else {
        showPage('home');
        setTimeout(() => {
            productsSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 500);
    }
}

// Bantuan
function showHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function hideHelpModal() {
    const modal = document.getElementById('helpModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Login page untuk masuk halaman
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    clearMessages('loginPage');

    if (!validateEmail(email)) {
        showError('loginEmailError', 'Format email tidak valid');
        return;
    }

    if (!password) {
        showError('loginPasswordError', 'Kata sandi harus diisi');
        return;
    }

    const user = appData.users.find(u => u.email === email && u.password === password);

    if (user) {
        appData.currentUser = user;
        showSuccess('loginSuccess', 'Login berhasil! Mengalihkan...');
        updateAuthUI();

        setTimeout(() => {
            clearForm('loginPage');
            showPage('home');
        }, 1500);
    } else {
        showError('loginError', 'Email atau kata sandi salah');
    }
}

function handleSignUp(event) {
    event.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;
    const confirmPassword = document.getElementById('signUpConfirmPassword').value;
    const fullName = document.getElementById('signUpFullName').value;
    const phone = document.getElementById('signUpPhone').value;

    clearMessages('signupPage');
    let isValid = true;

    // Validation
    if (!validateEmail(email)) {
        showError('signUpEmailError', 'Format email tidak valid');
        isValid = false;
    } else if (appData.users.find(u => u.email === email)) {
        showError('signUpEmailError', 'Email sudah terdaftar');
        isValid = false;
    }

    if (password.length < 8) {
        showError('signUpPasswordError', 'Kata sandi minimal 8 karakter');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError('signUpConfirmPasswordError', 'Konfirmasi kata sandi tidak sesuai');
        isValid = false;
    }

    if (fullName.length < 3 || fullName.length > 32 || /\d/.test(fullName)) {
        showError('signUpFullNameError', 'Nama lengkap 3-32 karakter, tidak boleh mengandung angka');
        isValid = false;
    }

    if (!validatePhone(phone)) {
        showError('signUpPhoneError', 'Format nomor handphone tidak valid (08xx, 10-16 digit)');
        isValid = false;
    }

    if (isValid) {
        appData.users.push({ email, password, name: fullName, phone });
        clearForm('signupPage');
        showSuccess('signUpSuccess', 'Pendaftaran berhasil! Silakan login.');

        setTimeout(() => {
            showPage('login');
        }, 2000);
    }
}

function handleForgotPassword(event) {
    event.preventDefault();
    clearMessages('forgotPasswordPage');

    const email = document.getElementById('forgotEmail').value;
    const user = appData.users.find(u => u.email === email);

    if (user) {
        userToResetPassword = email;
        showSuccess('forgotSuccess', "Instruksi reset 'terkirim'! Anda akan diarahkan...");

        setTimeout(() => {
            clearForm('forgotPasswordPage');
            showPage('resetPassword');
        }, 2500);
    } else {
        showError('forgotError', 'Email tidak ditemukan di sistem kami.');
    }
}

function handleResetPassword(event) {
    event.preventDefault();
    clearMessages('resetPasswordPage');

    const newPassword = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;
    let isValid = true;

    if (newPassword.length < 8) {
        showError('resetPasswordError', 'Kata sandi minimal 8 karakter.');
        isValid = false;
    }

    if (newPassword !== confirmPassword) {
        showError('resetConfirmPasswordError', 'Konfirmasi kata sandi tidak sesuai.');
        isValid = false;
    }

    if (isValid) {
        const user = appData.users.find(u => u.email === userToResetPassword);
        if (user) {
            user.password = newPassword;
            showSuccess('resetSuccess', 'Kata sandi berhasil diubah! Mengalihkan ke login...');
            userToResetPassword = null;

            setTimeout(() => {
                clearForm('resetPasswordPage');
                showPage('login');
            }, 2500);
        }
    }
}

function logout() {
    appData.currentUser = null;
    updateAuthUI();
    showPage('home');
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (appData.currentUser) {
        authButtons.style.display = 'none';
        userMenu.classList.add('active');
        userName.textContent = appData.currentUser.name;
    } else {
        authButtons.style.display = 'flex';
        userMenu.classList.remove('active');
    }
}

// Promoin produk
function showProductDetail(type) {
    currentInsuranceType = type;

    const productData = {
        health: {
            icon: 'bx bx-heart health',
            title: 'Asuransi Kesehatan Premium',
            subtitle: 'Perlindungan kesehatan terbaik untuk Anda dan keluarga',
            content: {
                'Manfaat Utama': [
                    'Cashless di 1000+ RS',
                    'Limit tahunan hingga Rp 2 Miliar',
                    'Manfaat rawat inap & jalan',
                    'Manfaat melahirkan & gigi',
                    'Layanan ambulans 24/7'
                ],
                'Fitur Tambahan': [
                    'Konsultasi dokter online',
                    'Medical check-up berkala',
                    'Penggantian kacamata',
                    'Fisioterapi',
                    'Second opinion'
                ]
            }
        },
        car: {
            icon: 'bx bx-car car',
            title: 'Asuransi Mobil Comprehensive',
            subtitle: 'Perlindungan menyeluruh untuk kendaraan kesayangan Anda',
            content: {
                'Jenis Perlindungan': [
                    'All Risk - Kerusakan ringan hingga berat',
                    'Total Loss Only',
                    'Bencana alam dan pencurian',
                    'Kerusuhan dan terorisme',
                    'Tanggung jawab hukum pihak ketiga'
                ],
                'Layanan Unggulan': [
                    'Bengkel rekanan terluas',
                    'Layanan derek 24 jam gratis',
                    'Emergency roadside assistance',
                    'Mobil pengganti',
                    'Klaim online'
                ]
            }
        },
        life: {
            icon: 'bx bx-shield-alt-2 life',
            title: 'Asuransi Jiwa Proteksi Plus',
            subtitle: 'Warisan terbaik untuk masa depan keluarga tercinta',
            content: {
                'Manfaat Perlindungan': [
                    'Uang pertanggungan hingga Rp 10 Miliar',
                    'Santunan meninggal dunia',
                    'Santunan kecelakaan 2x lipat',
                    'Manfaat investasi',
                    'Bebas premi jika cacat total'
                ],
                'Keunggulan Produk': [
                    'Premi terjangkau',
                    'Pencairan klaim cepat',
                    'Partial withdrawal',
                    'Bonus loyalitas',
                    'Perlindungan hingga usia 99 tahun'
                ]
            }
        }
    };

    const data = productData[type];
    document.getElementById('detailIcon').className = `detail-icon ${data.icon}`;
    document.getElementById('detailTitle').textContent = data.title;
    document.getElementById('detailSubtitle').textContent = data.subtitle;

    let contentHTML = '';
    Object.keys(data.content).forEach(key => {
                contentHTML += `
            <div class="detail-info">
                <h4>${key}</h4>
                <ul>
                    ${data.content[key].map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `;
    });
    
    document.getElementById('detailContent').innerHTML = contentHTML;
    showPage('detail');
}

function startPurchaseFlow() {
    if (!appData.currentUser) {
        alert('Silakan login terlebih dahulu untuk membeli produk');
        showPage('login');
        return;
    }
    showPurchaseForm(currentInsuranceType);
}

function showPurchaseForm(type) {
    currentInsuranceType = type;
    
    switch(type) {
        case 'car':
            showPage('purchaseCar');
            break;
        case 'health':
            showPage('purchaseHealth');
            break;
        case 'life':
            showPage('purchaseLife');
            break;
    }
}

// Hitung Premi
function calculateCarPremium() {
    const year = parseInt(document.getElementById('carYear').value);
    const price = parseInt(document.getElementById('carPrice').value);
    const resultDiv = document.getElementById('carPremiumResult');

    if (isNaN(year) || isNaN(price) || year <= 0 || price <= 0) {
        resultDiv.textContent = 'Mohon isi tahun dan harga mobil dengan benar.';
        return;
    }

    const currentYear = TODAY.getFullYear();
    const carAge = currentYear - year;
    let premiumRate = 0;

    if (carAge >= 0 && carAge <= 3) {
        premiumRate = 0.025;
    } else if (carAge > 3 && carAge <= 5) {
        premiumRate = (price < 200000000) ? 0.04 : 0.03;
    } else if (carAge > 5) {
        premiumRate = 0.05;
    }

    const premium = price * premiumRate;
    currentTransaction.premium = premium;
    
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Premi Tahunan</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${formatRupiah(premium)}</div>
        </div>
    `;
}

function calculateHealthPremium() {
    const dob = document.getElementById('healthDob').value;
    const isSmoker = parseInt(document.getElementById('healthSmoker').value);
    const hasHypertension = parseInt(document.getElementById('healthHypertension').value);
    const hasDiabetes = parseInt(document.getElementById('healthDiabetes').value);
    const resultDiv = document.getElementById('healthPremiumResult');

    if (!dob) {
        resultDiv.textContent = 'Mohon isi tanggal lahir.';
        return;
    }

    const age = calculateAge(dob);
    const P = 2000000;
    let m = 0;

    if (age <= 20) m = 0.1;
    else if (age > 20 && age <= 35) m = 0.2;
    else if (age > 35 && age <= 50) m = 0.25;
    else if (age > 50) m = 0.4;

    const premium = P + (m * P) + (isSmoker * 0.5 * P) + (hasHypertension * 0.4 * P) + (hasDiabetes * 0.5 * P);
    currentTransaction.premium = premium;
    
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Premi Tahunan</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${formatRupiah(premium)}</div>
        </div>
    `;
}

function calculateLifePremium() {
    const dob = document.getElementById('lifeDob').value;
    const coverage = parseInt(document.getElementById('lifeCoverage').value);
    const resultDiv = document.getElementById('lifePremiumResult');

    if (!dob || isNaN(coverage)) {
        resultDiv.textContent = 'Mohon isi tanggal lahir dan pilih pertanggungan.';
        return;
    }

    const age = calculateAge(dob);
    let m = 0;

    if (age <= 30) m = 0.002;
    else if (age > 30 && age <= 50) m = 0.004;
    else if (age > 50) m = 0.01;

    const premium = m * coverage;
    currentTransaction.premium = premium;
    
    resultDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">Premi Bulanan</div>
            <div style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${formatRupiah(premium)}</div>
        </div>
    `;
}

// Checkout Functions
function proceedToCheckout(event, type) {
    event.preventDefault();
    
    if (!currentTransaction.premium || currentTransaction.premium <= 0) {
        alert('Harap hitung premi terlebih dahulu.');
        return;
    }
    
    const productNames = {
        health: 'Asuransi Kesehatan Premium',
        car: 'Asuransi Mobil Comprehensive',
        life: 'Asuransi Jiwa Proteksi Plus'
    };
    
    currentTransaction.productName = productNames[type];
    currentTransaction.type = type;

    document.getElementById('checkoutProduct').textContent = currentTransaction.productName;
    document.getElementById('checkoutPremium').textContent = formatRupiah(currentTransaction.premium);
    
    showPage('checkout');
}

function selectPaymentMethod(element) {
    const options = document.querySelectorAll('.payment-option');
    options.forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
}

function finalizePurchase() {
    const selectedPayment = document.querySelector('.payment-option.selected');
    if (!selectedPayment) {
        alert('Silakan pilih metode pembayaran terlebih dahulu.');
        return; 
    }

    const purchase = {
        product: currentTransaction.productName,
        type: currentTransaction.type,
        date: TODAY.toLocaleDateString('id-ID'),
        amount: currentTransaction.premium,
        status: 'Lunas'
    };

    appData.purchaseHistory.push(purchase);
    
    switch(currentTransaction.type) {
        case 'car':
            clearForm('purchaseCarPage');
            break;
        case 'health':
            clearForm('purchaseHealthPage');
            break;
        case 'life':
            clearForm('purchaseLifePage');
            break;
    }

    selectedPayment.classList.remove('selected');
    currentTransaction = {};
    alert('Pembayaran berhasil! Terima kasih telah membeli produk kami.');
    showPage('history');
}

function loadHistory() {
    const tbody = document.getElementById('historyTableBody');
    
    if (appData.purchaseHistory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                    Belum ada riwayat pembelian
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = appData.purchaseHistory.map(item => `
        <tr>
            <td>${item.product}</td>
            <td>
                <span style="
                    padding: 0.25rem 0.75rem; 
                    border-radius: 0.5rem; 
                    font-size: 0.75rem; 
                    font-weight: 600; 
                    text-transform: uppercase;
                    background: rgba(102, 126, 234, 0.1);
                    color: #667eea;
                ">
                    ${item.type}
                </span>
            </td>
            <td>${item.date}</td>
            <td style="font-weight: 600; color: #667eea;">${formatRupiah(item.amount)}</td>
            <td><span class="status-paid">${item.status}</span></td>
        </tr>
    `).join('');
}

// Utility Functions
function calculateAge(birthDateString) {
    const birthDate = new Date(birthDateString);
    let age = TODAY.getFullYear() - birthDate.getFullYear();
    const monthDifference = TODAY.getMonth() - birthDate.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && TODAY.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function clearForm(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        const inputs = page.querySelectorAll('input, select');
        inputs.forEach(input => {
            if (input.type === 'file') return;
            
            if (input.type === 'date' || input.type === 'text' || 
                input.type === 'number' || input.type === 'password' || 
                input.type === 'email') {
                input.value = '';
            } else if (input.tagName.toLowerCase() === 'select') {
                input.selectedIndex = 0;
            }
        });
        
        const premiumResult = page.querySelector('.premium-result');
        if (premiumResult) {
            premiumResult.innerHTML = '';
        }
        
        clearMessages(pageId);
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^08\d{8,14}$/.test(phone);
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function clearMessages(pageId) {
    const page = document.getElementById(pageId);
    if (page) {
        page.querySelectorAll('.error-message, .success-message')
            .forEach(msg => msg.style.display = 'none');
    }
}

function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Initialize Interactions
function initializeInteractions() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            if (!this.classList.contains('loading')) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
        
        button.addEventListener('mouseleave', function() {
            if (!this.classList.contains('loading')) {
                this.style.transform = 'translateY(0) scale(1)';
            }
        });
        
        button.addEventListener('mousedown', function() {
            if (!this.classList.contains('loading')) {
                this.style.transform = 'translateY(0) scale(0.98)';
            }
        });
        
        button.addEventListener('mouseup', function() {
            if (!this.classList.contains('loading')) {
                this.style.transform = 'translateY(-2px) scale(1.02)';
            }
        });
    });

    // Input effects
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Modal interactions
    document.addEventListener('click', function(event) {
        const modal = document.querySelector('.modal-overlay.active');
        if (modal && event.target === modal) {
            hideHelpModal();
        }
    });

    // Keyboard interactions
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.querySelector('.modal-overlay.active');
            if (modal) {
                hideHelpModal();
            }
        }
    });
}

// Loading state functions
function addLoadingState(element) {
    element.classList.add('loading');
    element.style.pointerEvents = 'none';
}

function removeLoadingState(element) {
    element.classList.remove('loading');
    element.style.pointerEvents = 'auto';
}