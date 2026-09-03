// ==================== بخش لاگین: سیستم امنیت و احراز هویت ادمین ====================

// ۱. تعریف فایلهایی که برای ورود به آنها نیاز به لاگین نیست
const currentPage = window.location.pathname.split("/").pop();

// ۲. بررسی وضعیت لاگین بودن ادمین (Route Protection)
if (currentPage !== 'login.html' && currentPage !== '') {
    // اگر در صفحات پنل بود و در حافظه مرورگر علامت لاگین ثبت نشده بود
    if (!sessionStorage.getItem('isAdminLoggedIn')) {
        // هدایت مستقیم کاربر به صفحه لاگین
        window.location.href = 'login.html';
    }
}

// ۳. منطق فرم سابمیت لاگین (فقط در صفحه login.html اجرا می‌شود)
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault(); // جلوگیری از رفرش صفحه

        const emailInput = document.getElementById('loginEmail').value.trim().toLowerCase();
        const passwordInput = document.getElementById('loginPassword').value.trim();

        let savedSettings = {};
        try {
            savedSettings = JSON.parse(localStorage.getItem('adminPanelSettings') || '{}');
        } catch (error) {
            localStorage.removeItem('adminPanelSettings');
        }

        const correctEmail = (savedSettings.profEmail || "ali@example.com").trim().toLowerCase();
        const correctPassword = savedSettings.password || "123";

        // الف) بررسی صحت ایمیل و رمز عبور
        if (emailInput === correctEmail && passwordInput === correctPassword) {

            // ذخیره کردن وضعیت ورود در حافظه مرورگر
            sessionStorage.setItem('isAdminLoggedIn', 'true');

            // نمایش پیام موفقیت‌آمیز شیک با SweetAlert2
            Swal.fire({
                title: 'Welcome Back!',
                text: 'Login successful. Redirecting to dashboard...',
                icon: 'success',
                confirmButtonColor: '#384827',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // هدایت ادمین به صفحه اصلی داشبورد پس از ۱.۵ ثانیه
                window.location.href = 'index.html';
            });

        } else {
            // ب) در صورت اشتباه بودن اطلاعات، اخطار قرمز نمایش داده می‌شود
            Swal.fire({
                title: 'Login Failed!',
                text: 'Invalid email address or password. Please try again.',
                icon: 'error',
                confirmButtonColor: '#af0b3f'
            });
        }
    });
}


// dynamic toggle active class to navigation list items ----------------------
const list = document.querySelectorAll('.navigation li');

function activeLink() {
    list.forEach(item => item.classList.remove('hovered'));
    this.classList.add('hovered');
}

list.forEach(item => item.addEventListener('mouseover', activeLink));

// menu toggle ------------------
const toggle = document.querySelector('.toggle');
const navigation = document.querySelector('.navigation');
const main = document.querySelector('.main');
const settingsStorageKey = 'adminPanelSettings';

function applySavedProfileImage() {
    let savedSettings = {};

    try {
        savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');
    } catch (error) {
        localStorage.removeItem(settingsStorageKey);
    }

    if (savedSettings.profileImage) {
        document.querySelectorAll('.topbar .user img').forEach(image => {
            image.src = savedSettings.profileImage;
        });
    }
}

applySavedProfileImage();

window.addEventListener('storage', function (event) {
    if (event.key !== settingsStorageKey) return;

    const savedSettings = JSON.parse(event.newValue || '{}');
    if (savedSettings.profileImage) {
        document.querySelectorAll('.topbar .user img').forEach(image => {
            image.src = savedSettings.profileImage;
        });

        const profilePreview = document.getElementById('profileimagePreview');
        if (profilePreview) {
            profilePreview.src = savedSettings.profileImage;
        }
    }
});

if (toggle && navigation && main) {
    toggle.addEventListener('click', function () {
        navigation.classList.toggle('active');
        main.classList.toggle('active');
    });
}

// sign out modal
const signOutBtn = document.querySelector('[data-modal="logoutModal"]');
const logoutModal = document.getElementById('logoutModal');
const closeModalBtn = document.getElementById('closeModal');
const confirmLogoutBtn = document.querySelector('#logoutModal .confirm-btn');

if (signOutBtn && logoutModal) {
    signOutBtn.addEventListener('click', function (event) {
        event.preventDefault();
        logoutModal.style.display = 'flex';
    });
}

if (closeModalBtn && logoutModal) {
    closeModalBtn.addEventListener('click', function () {
        logoutModal.style.display = 'none';
    });
}

if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', function (event) {
        event.preventDefault();
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.href = 'login.html';
    });
}

window.addEventListener('click', function (event) {
    if (event.target === logoutModal) {
        logoutModal.style.display = 'none';
    }
});


// ==================== بخش داشبورد: مدیریت داده‌ها و رندر سفارشات اخیر ====================

// ۱. آرایه داده‌های پویای سفارشات اخیر (Recent Orders)
const ordersData = [
    { name: "Star Refrigerator", price: "$34,890", payment: "Paid", status: "Delivered" },
    { name: "Dell Laptop", price: "$560", payment: "Due", status: "Pending" },
    { name: "Apple Watch", price: "$90", payment: "Paid", status: "Return" },
    { name: "Samsung Phone", price: "$389", payment: "Due", status: "inProgress" },
    { name: "Star Refrigerator", price: "$34,890", payment: "Paid", status: "Delivered" },
    { name: "Dell Laptop", price: "$560", payment: "Due", status: "Pending" }
];

const ordersTableBody = document.getElementById('ordersTableBody');

// ۲. تابع اختصاصی رندر جدول سفارشات داشبورد
// function renderOrdersTable(dataToRender = ordersData) {
//     if (!ordersTableBody) return; // اگر در صفحه‌ای غیر از داشبورد باشیم، این تابع متوقف می‌شود

//     ordersTableBody.innerHTML = ''; // پاک کردن محتوای استاتیک قدیمی

//     if (dataToRender.length === 0) {
//         ordersTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">No orders found.</td></tr>';
//         return;
//     }

//     dataToRender.forEach(order => {
//         const row = document.createElement('tr');

//         // استانداردسازی متن وضعیت برای ست شدن دقیق با کلاس‌های CSS شما
//         const statusClass = String(order.status).trim().toLowerCase();

//         row.innerHTML = `
//             <td>${order.name}</td>
//             <td>${order.price}</td>
//             <td>${order.payment}</td>
//             <td>
//                 <span class="status ${statusClass}">${order.status}</span>
//             </td>
//         `;

//         ordersTableBody.appendChild(row);
//     });
// }

// ۲. تابع اختصاصی رندر جدول سفارشات داشبورد (نسخه ارتقا یافته با تغییر وضعیت و دکمه اکشن)
function renderOrdersTable(dataToRender = ordersData) {
    if (!ordersTableBody) return;

    ordersTableBody.innerHTML = '';

    if (dataToRender.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--black2);">No orders found.</td></tr>`;
        return;
    }

    dataToRender.forEach((order, index) => {
        const row = document.createElement('tr');
        const statusClass = String(order.status).trim().toLowerCase();

        // تولید جدول با استفاده از منوی انتخابی سفارشی (Select) و دکمه چشم (Detail)
        row.innerHTML = `
            <td>${order.name}</td>
            <td>${order.price}</td>
            <td>${order.payment}</td>
            <td>
                <select class="status-select ${statusClass}" data-id="${index}">
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Return" ${order.status === 'Return' ? 'selected' : ''}>Return</option>
                    <option value="inProgress" ${order.status === 'inProgress' ? 'selected' : ''}>inProgress</option>
                </select>
            </td>
            <td>
                <a href="#" class="view-order-btn" data-id="${index}"><i class="fas fa-eye"></i></a>
            </td>
        `;

        ordersTableBody.appendChild(row);
    });
}

// ==================== منطق عملیاتی تغییر وضعیت و نمایش جزئیات فاکتور ====================

if (ordersTableBody) {
    // الف) گوش به زنگ برای تغییر منوی کشویی وضعیت سفارش
    ordersTableBody.addEventListener('change', function (event) {
        const statusSelect = event.target.closest('.status-select');
        if (statusSelect) {
            const orderIndex = parseInt(statusSelect.getAttribute('data-id'));
            const newStatus = statusSelect.value;

            if (!isNaN(orderIndex) && ordersData[orderIndex]) {
                // آپدیت کردن وضعیت در آرایه داده‌های اصلی
                ordersData[orderIndex].status = newStatus;

                // به‌روزرسانی آنی کلاس رنگی منوی کشویی بدون رندر کل جدول
                statusSelect.className = `status-select ${newStatus.toLowerCase()}`;

                // نمایش پیام موفقیت‌آمیز شیک با SweetAlert2 آفلاین
                Swal.fire({
                    title: 'Status Updated!',
                    text: `Order status changed to ${newStatus}.`,
                    icon: 'success',
                    confirmButtonColor: '#384827',
                    timer: 1500
                });
            }
        }
    });

    // ب) گوش به زنگ برای کلیک روی دکمه نمایش جزئیات (آیکون چشم) با آیکون‌های فونت‌آوسم
    ordersTableBody.addEventListener('click', function (event) {
        const viewBtn = event.target.closest('.view-order-btn');
        if (viewBtn) {
            event.preventDefault();
            const orderIndex = parseInt(viewBtn.getAttribute('data-id'));

            if (!isNaN(orderIndex) && ordersData[orderIndex]) {
                const order = ordersData[orderIndex];

                // باز کردن فاکتور لوکس با آیکون‌های رسمی Font Awesome
                Swal.fire({
                    title: '<strong style="color:var(--NavColor); font-family: \'poppins\';"><i class="fas fa-file-invoice-dollar"></i> Order Invoice Details</strong>',
                    icon: 'info',
                    html: `
                        <div style="text-align: left; font-size: 15px; line-height: 2.2; font-family: 'poppins'; padding: 10px;">
                            <p><i class="fas fa-box" style="color: var(--NavColor); width: 25px;"></i> <strong>Product Name:</strong> ${order.name}</p>
                            <p><i class="fas fa-tags" style="color: var(--NavColor); width: 25px;"></i> <strong>Total Price:</strong> ${order.price}</p>
                            <p><i class="fas fa-credit-card" style="color: var(--NavColor); width: 25px;"></i> <strong>Payment Status:</strong> ${order.payment}</p>
                            <p><i class="fas fa-shipping-fast" style="color: var(--NavColor); width: 25px;"></i> <strong>Shipping Status:</strong> ${order.status}</p>
                            <p><i class="fas fa-calendar-alt" style="color: var(--NavColor); width: 25px;"></i> <strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
                            <p><i class="fas fa-fingerprint" style="color: var(--NavColor); width: 25px;"></i> <strong>Transaction ID:</strong> TXN-${Math.floor(100000 + Math.random() * 900000)}</p>
                        </div>
                    `,
                    showCloseButton: true,
                    confirmButtonColor: '#384827',
                    confirmButtonText: 'Close Invoice'
                });
            }
        }
    });
}

// ۳. اجرای خودکار تابع رندر سفارشات به محض لود شدن صفحه داشبورد
if (ordersTableBody) {
    renderOrdersTable();
}

// ==================== منطق کارت‌های آمار بالای صفحه (Card Box) ====================

// ۱. متغیرهای منبع داده برای آمارهای مستقل
const dashboardStats = {
    dailyViews: "1,560",
    comments: "150",
    earning: "$15,500"
};

// ۲. تابع به روزرسانی و رندر کارت‌های آمار
function updateDashboardCards() {
    const statViews = document.getElementById('statViews');
    const statSales = document.getElementById('statSales');
    const statComments = document.getElementById('statComments');
    const statEarning = document.getElementById('statEarning');

    // تزریق آمار بازدید و نظرات و درآمد از شیء داده
    if (statViews) statViews.innerText = dashboardStats.dailyViews;
    if (statComments) statComments.innerText = dashboardStats.comments;
    if (statEarning) statEarning.innerText = dashboardStats.earning;

    // محاسبه هوشمند تعداد فروش بر اساس طول آرایه سفارشات (ordersData)
    if (statSales && typeof ordersData !== 'undefined') {
        statSales.innerText = ordersData.length;
    }
}

// ۳. اجرای خودکار تابع آپدیت کارت‌ها هنگام لود صفحه داشبورد
if (document.getElementById('statViews')) {
    updateDashboardCards();
}

// ==================== منطق جستجوی زنده سفارشات داشبورد ====================

// گرفتن اینپوت سرچ در صفحه داشبورد
const dashboardSearchInput = document.querySelector('.main .topbar .search input');

if (dashboardSearchInput) {
    dashboardSearchInput.addEventListener('input', function () {
        // ۱. دریافت متن تایپ شده، حذف فاصله‌ها و کوچک کردن حروف برای سرچ دقیق
        const searchTerm = dashboardSearchInput.value.toLowerCase().trim();

        // ۲. فیلتر کردن آرایه سفارشات بر اساس همه ستون‌ها
        const filteredOrders = ordersData.filter(order => {
            const searchableText = [order.name, order.price, order.payment, order.status]
                .filter(value => value !== undefined && value !== null)
                .join(' ')
                .toLowerCase();

            // بررسی وجود عبارت جستجو در اطلاعات سفارش
            return searchableText.includes(searchTerm);
        });

        // ۳. رندر مجدد جدول فقط با سفارشات پیدا شده
        renderOrdersTable(filteredOrders);
    });
}

// ==================== منطق رندر پویای مشتریان اخیر در داشبورد ====================

const recentCustomersList = document.getElementById('recentCustomersList');

function renderRecentCustomers() {
    if (!recentCustomersList || typeof customersData === 'undefined') return;

    recentCustomersList.innerHTML = ''; // پاک کردن اطلاعات استاتیک قدیمی

    // گرفتن ۵ مشتری آخر آرایه به صورت برعکس (تا آخرین افراد ثبت‌نامی در بالا باشند)
    const latestCustomers = customersData.slice(-5).reverse();

    latestCustomers.forEach(customer => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td style="width: 60px;">
                <div class="imgBox">
                    <img src="${customer.image || 'assets/1.png'}" alt="${customer.name}">
                </div>
            </td>
            <td>
                <h4>${customer.name} <span>${customer.email}</span></h4>
            </td>
        `;

        recentCustomersList.appendChild(tr);
    });
}

// =========================================================================
// CUSTOMER PAGE PORTION (Dynamic Data, Search, Filter, CRUD & SweetAlert2)
// =========================================================================

// جای ذخیره کردن داده‌های مشتریان (منبع داده اولیه)
const customersData = [
    { name: "Sayed Shabir", email: "shabir@example.com", totalSpent: "$1,200", status: "Active", image: "assets/1.png" },
    { name: "Milad", email: "milad@example.com", totalSpent: "$850", status: "Pending", image: "assets/6.png" },
    { name: "karim", email: "karim@example.com", totalSpent: "$0", status: "Banned", image: "assets/3.png" },
    { name: "Sayaf", email: "sayaf@example.com", totalSpent: "$0", status: "Active", image: "assets/4.png" }
];

// اجرای خودکار تابع هنگام لود شدن صفحه داشبورد
if (recentCustomersList) {
    renderRecentCustomers();
}

const customerTableBody = document.getElementById('customerTableBody');
const customerModal = document.getElementById('customerModal');
const addCustomerBtn = document.querySelector('.cardHeader .btn'); // دکمه + Add Customer
const closeCustomerModalBtn = document.getElementById('closeCustomerModal');
const customerForm = document.getElementById('customerForm');
const searchInput = document.querySelector('.search input');
const statusFilter = document.querySelector('.filterBox select');

// متغیر سراسری برای تشخیص حالت (1- یعنی افزودن، مقادیر دیگر یعنی ایندکس ویرایش)
let editIndex = -1;

// ۱. تابع تعیین کلاس وضعیت بر اساس متن ورودی
function getStatusClass(status) {
    const normalized = String(status).trim().toLowerCase();
    if (normalized === 'pending') return 'pending';
    if (normalized === 'banned') return 'return';
    if (normalized === 'active') return 'delivered';
    return 'inprogress';
}

// ۲. تابع اصلی رندر جدول مشتریان (با پشتیبانی از داده‌های فیلتر شده)
function renderCustomerTable(dataToRender = customersData) {
    if (!customerTableBody) return;

    customerTableBody.innerHTML = '';

    if (dataToRender.length === 0) {
        customerTableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 20px; color: var(--black2);">No customers found.</td></tr>`;
        return;
    }

    dataToRender.forEach((customer, index) => {
        const row = document.createElement('tr');
        const statusClass = getStatusClass(customer.status);
        const customerName = customer.name || 'Unknown';

        // تزریق ایندکس واقعی به ویژگی data-id دکمه‌ها برای مدیریت دقیق CRUD
        row.innerHTML = `
            <td class="customerCell">
                <div class="customerInfo">
                    <div class="imgBox"><img src="${customer.image || 'assets/1.png'}" alt="${customerName}"></div>
                    <h4>${customerName}</h4>
                </div>
            </td>
            <td>${customer.email}</td>
            <td>${customer.totalSpent}</td>
            <td><span class="status ${statusClass}">${customer.status}</span></td>
            <td>
                <div class="actionButtons">
                    <a href="#" class="editBtn" data-id="${index}"><i class="fas fa-edit"></i></a>
                    <a href="#" class="deleteBtn" data-id="${index}"><i class="fas fa-trash"></i></a>
                </div>
            </td>
        `;
        customerTableBody.appendChild(row);
    });
}

renderCustomerTable();

// ۳. منطق فیلتر و جستجوی همزمان زنده
function filterAndSearchCustomers() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const filterValue = statusFilter ? statusFilter.value.toLowerCase() : '';

    const filteredData = customersData.filter(customer => {
        const customerName = (customer.name || '').toLowerCase();
        const customerEmail = (customer.email || '').toLowerCase();
        const customerStatus = (customer.status || '').toLowerCase();

        const matchesSearch = customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
        const matchesFilter = filterValue === '' || customerStatus === filterValue;

        return matchesSearch && matchesFilter;
    });

    renderCustomerTable(filteredData);
}

// متصل کردن رویدادهای سرچ و فیلتر تاپ‌بار
if (searchInput) searchInput.addEventListener('input', filterAndSearchCustomers);
if (statusFilter) statusFilter.addEventListener('change', filterAndSearchCustomers);


// ۴. باز و بسته کردن پاپ‌آپ مودال مشتری
if (addCustomerBtn && customerModal) {
    addCustomerBtn.addEventListener('click', function (event) {
        event.preventDefault();
        editIndex = -1; // ریست کردن به حالت افزودن مشتری جدید
        if (customerForm) customerForm.reset();
        document.getElementById('modalTitle').innerText = "Add New Customer";
        customerModal.style.display = 'flex';
    });
}

if (closeCustomerModalBtn && customerModal) {
    closeCustomerModalBtn.addEventListener('click', function () {
        customerModal.style.display = 'none';
    });
}

window.addEventListener('click', function (event) {
    if (event.target === customerModal) {
        customerModal.style.display = 'none';
    }
});


// ۵. منطق عملیاتی ثبت فرم (افزودن و ویرایش) به همراه FileReader تصاویر
if (customerForm) {
    customerForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const nameValue = document.getElementById('cName').value.trim();
        const emailValue = document.getElementById('cEmail').value.trim();
        const spentValue = document.getElementById('cSpent').value.trim() || "$0";
        const statusValue = document.getElementById('cStatus').value;
        const imageInput = document.getElementById('cImage');

        // تابع ثبت اطلاعات نهایی در آرایه
        function saveCustomerData(imageSrc) {
            if (editIndex === -1) {
                // حالت افزودن
                const newCustomer = {
                    name: nameValue,
                    email: emailValue,
                    totalSpent: spentValue,
                    status: statusValue,
                    image: imageSrc
                };
                customersData.push(newCustomer);

                Swal.fire({
                    title: 'Added!',
                    text: 'New customer has been added successfully.',
                    icon: 'success',
                    confirmButtonColor: '#384827',
                    timer: 2000
                });
            } else {
                // حالت ویرایش
                customersData[editIndex].name = nameValue;
                customersData[editIndex].email = emailValue;
                customersData[editIndex].totalSpent = spentValue;
                customersData[editIndex].status = statusValue;

                if (imageInput && imageInput.files && imageInput.files.length > 0) {
                    customersData[editIndex].image = imageSrc;
                }

                Swal.fire({
                    title: 'Updated!',
                    text: 'Customer details have been updated successfully.',
                    icon: 'success',
                    confirmButtonColor: '#384827',
                    timer: 2000
                });

                editIndex = -1; // بازگشت به حالت پیش‌فرض
            }

            filterAndSearchCustomers(); // به‌روزرسانی جدول بر اساس فیلترهای جاری
            customerModal.style.display = 'none';
            customerForm.reset();
        }

        // بررسی اینکه آیا تصویر جدیدی انتخاب شده است یا خیر
        if (imageInput && imageInput.files && imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                saveCustomerData(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            // استفاده از تصویر قبلی در صورت ویرایش، یا تصویر پیش‌فرض در صورت افزودن
            const currentImg = (editIndex !== -1) ? customersData[editIndex].image : "assets/1.png";
            saveCustomerData(currentImg);
        }
    });
}


// ۶. رویداد کلیک روی دکمه‌های حذف و ویرایش درون جدول (Event Delegation)
if (customerTableBody) {
    customerTableBody.addEventListener('click', function (event) {

        // بخش الف: منطق حذف مشتری
        const deleteBtn = event.target.closest('.deleteBtn');
        if (deleteBtn) {
            event.preventDefault();
            const customerIndex = parseInt(deleteBtn.getAttribute('data-id'));

            if (!isNaN(customerIndex) && customersData[customerIndex]) {
                const customerName = customersData[customerIndex].name || 'this customer';

                // پاپ‌آپ تایید حذف SweetAlert2
                Swal.fire({
                    title: 'Are you sure?',
                    text: `You are about to delete ${customerName}. This action cannot be undone!`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#af0b3f',
                    cancelButtonColor: '#999',
                    confirmButtonText: 'Yes, delete!',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed) {
                        customersData.splice(customerIndex, 1);
                        filterAndSearchCustomers();

                        Swal.fire({
                            title: 'Deleted!',
                            text: `${customerName} has been deleted.`,
                            icon: 'success',
                            confirmButtonColor: '#384827',
                            timer: 1800
                        });
                    }
                });
            }
        }

        // بخش ب: منطق لود اطلاعات در فرم جهت ویرایش مشتری
        const editBtn = event.target.closest('.editBtn');
        if (editBtn) {
            event.preventDefault();
            const customerIndex = parseInt(editBtn.getAttribute('data-id'));

            if (!isNaN(customerIndex) && customersData[customerIndex]) {
                const customer = customersData[customerIndex];
                editIndex = customerIndex; // ذخیره ایندکس برای ویرایش
                loadCustomerDataForEdit(customer);
            }
        }
    });
}      // ==================== منطق دکمه ویرایش مشتری (Edit) ====================

if (customerTableBody) {
    customerTableBody.addEventListener('click', function (event) {
        // ۱. پیدا کردن دکمه ویرایش کلیک شده (حتی اگر روی آیکون i کلیک شود)
        const editBtn = event.target.closest('.editBtn');

        if (editBtn) {
            event.preventDefault(); // جلوگیری از رفتار پیش‌فرض لینک

            // ۲. گرفتن ایندکس واقعی مشتری از ویژگی data-id دکمه
            const customerIndex = parseInt(editBtn.getAttribute('data-id'));

            // ۳. بررسی معتبر بودن ردیف در آرایه داده‌ها
            if (!isNaN(customerIndex) && customersData[customerIndex]) {
                const customer = customersData[customerIndex];

                // ۴. ذخیره ایندکس در متغیر سراسری (برای استفاده موقع ثبت نهایی فرم)
                editIndex = customerIndex;

                // ۵. تزریق و پر کردن فیلدهای فرم پاپ‌آپ با اطلاعات قدیمی مشتری
                document.getElementById('cName').value = customer.name;
                document.getElementById('cEmail').value = customer.email;
                document.getElementById('cSpent').value = customer.totalSpent;
                document.getElementById('cStatus').value = customer.status;

                // ۶. تغییر دادن متن عنوان مودال به حالت ویرایش
                document.getElementById('modalTitle').innerText = "Edit Customer Details";

                // ۷. باز کردن و نمایش پاپ‌آپ مودال در مرکز صفحه
                customerModal.style.display = 'flex';
            }
        }
    });
}

// ==================== منطق نهایی باکس جستجوی زنده (Search Bar) ====================

// ۱. رویداد زنده تایپ کردن در باکس جستجو
if (searchInput) {
    searchInput.addEventListener('input', function () {

        // ۲. دریافت متن تایپ شده و تبدیل به حروف کوچک (برای نادیده گرفتن حساسیت حروف بزرگ و کوچک)
        const searchTerm = searchInput.value.toLowerCase().trim();

        // ۳. دریافت وضعیت انتخابی از فیلتر (اگر انتخابی صورت گرفته باشد)
        const filterValue = statusFilter ? statusFilter.value.toLowerCase() : '';

        // ۴. فیلتر کردن هوشمند آرایه داده‌ها بدون آسیب زدن به آرایه اصلی
        const filteredData = customersData.filter(customer => {
            const customerName = (customer.name || '').toLowerCase();
            const customerEmail = (customer.email || '').toLowerCase();
            const customerStatus = (customer.status || '').toLowerCase();

            // الف) شرط مطابقت نام یا ایمیل با متن جستجو شده
            const matchesSearch = customerName.includes(searchTerm) || customerEmail.includes(searchTerm);

            // ب) شرط مطابقت با منوی کشویی وضعیت
            const matchesFilter = filterValue === '' || customerStatus === filterValue;

            // اگر هر دو شرط برقرار بود، این مشتری در آرایه فیلتر شده باقی می‌ماند
            return matchesSearch && matchesFilter;
        });

        // ۵. رندر مجدد جدول فقط با داده‌های فیلتر شده (بدون رفرش صفحه)
        renderCustomerTable(filteredData);
    });
}

// ==================== بخش پیام‌ها: مدیریت چت‌ها و گفتگوها ====================

// ۱. آرایه داده‌های پویای پیام‌ها و مخاطبین
const chatsData = [
    {
        id: 0,
        name: "Sayed Shabir",
        image: "assets/1.png",
        status: "Online",
        lastTime: "10:30 AM",
        messages: [
            { text: "Hello, I have a question about my last order status.", type: "incoming" },
            { text: "Hi Sayed! Sure, please provide your order ID.", type: "outgoing" },
            { text: "It's #ORD-8924. Is the new stock available too?", type: "incoming" }
        ]
    },
    {
        id: 1,
        name: "jaweed Sarwari",
        image: "assets/3.png",
        status: "Offline",
        lastTime: "Yesterday",
        messages: [
            { text: "Hi, thanks for the amazing service!", type: "incoming" },
            { text: "You're very welcome, Sara! Glad you like it.", type: "outgoing" },
            { text: "Thank you for the quick support!", type: "incoming" }
        ]
    }
];

// متغیر سراسری برای ذخیره شناسه چت فعال فعلی (به صورت پیش‌فرض اولین چت)
let activeChatId = 0;

const chatListContainer = document.getElementById('chatListContainer');
const activeChatHeader = document.getElementById('activeChatHeader');
const chatMessageBody = document.getElementById('chatMessageBody');

// ۲. تابع رندر کردن لیست مخاطبین در سمت چپ
function renderChatList() {
    if (!chatListContainer) return;
    chatListContainer.innerHTML = '';

    chatsData.forEach(chat => {
        const lastMsg = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : '';
        const isActive = chat.id === activeChatId ? 'activeChat' : '';

        const chatItem = document.createElement('div');
        chatItem.className = `chatItem ${isActive}`;
        chatItem.setAttribute('data-chat-id', chat.id);

        chatItem.innerHTML = `
            <div class="imgBox"><img src="${chat.image}" alt="${chat.name}"></div>
            <div class="chatDetails">
                <h4>${chat.name} <span class="chatTime">${chat.lastTime}</span></h4>
                <p>${lastMsg}</p>
            </div>
        `;

        chatListContainer.appendChild(chatItem);
    });
}

// ۳. تابع رندر کردن پیام‌های مخاطب فعال در سمت راست
function renderActiveChat() {
    if (!chatMessageBody || !activeChatHeader) return;

    // پیدا کردن اطلاعات مخاطب فعال
    const currentChat = chatsData.find(c => c.id === activeChatId);
    if (!currentChat) return;

    // الف) بروزرسانی هدر چت
    activeChatHeader.innerHTML = `
        <div class="imgBox"><img src="${currentChat.image}" alt="${currentChat.name}"></div>
        <h4>${currentChat.name} <span>${currentChat.status}</span></h4>
    `;

    // ب) رندر حباب‌های پیام در بدنه چت
    chatMessageBody.innerHTML = '';
    currentChat.messages.forEach(msg => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${msg.type}`;
        msgDiv.innerHTML = `<p>${msg.text}</p>`;
        chatMessageBody.appendChild(msgDiv);
    });

    // اسکرول خودکار به انتهای چت
    chatMessageBody.scrollTop = chatMessageBody.scrollHeight;
}

// ۴. رویداد کلیک برای جابجایی بین چت‌ها
if (chatListContainer) {
    chatListContainer.addEventListener('click', function (e) {
        const clickedItem = e.target.closest('.chatItem');
        if (clickedItem) {
            const chatId = parseInt(clickedItem.getAttribute('data-chat-id'));
            activeChatId = chatId;

            renderChatList();   // رندر مجدد لیست برای تغییر کلاس activeChat
            renderActiveChat(); // لود پیام‌های مخاطب جدید در سمت راست
        }
    });
}

// اجرای اولویت‌دار توابع هنگام ورود به صفحه پیام‌ها
if (chatListContainer) {
    renderChatList();
    renderActiveChat();
}


// ==================== منطق ارسال پیام جدید توسط ادمین ====================

const msgInput = document.getElementById('msgInput');
const sendMsgBtn = document.getElementById('sendMsgBtn');

// ==================== منطق ارتقا یافته ارسال پیام و پاسخ خودکار هوشمند ====================

// یک بانک جملات آماده برای پاسخ‌های خودکار مخاطبین
const botReplies = [
    "Got it! Let me check that for you right away.",
    "Thanks for the information. I will look into it.",
    "Perfect! Is there anything else I can help you with?",
    "Understood, I am working on it now.",
    "Great! Thank you for the quick update."
];

function sendMessage() {
    if (!msgInput) return;

    const messageText = msgInput.value.trim();
    if (messageText === '') return;

    const currentChat = chatsData.find(c => c.id === activeChatId);

    if (currentChat) {
        // ۱. اضافه کردن پیام ارسالی ادمین
        currentChat.messages.push({
            text: messageText,
            type: "outgoing"
        });

        // تنظیم ساعت فعلی
        const updateTime = () => {
            const now = new Date();
            let hours = now.getHours();
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
            return `${hours}:${minutes} ${ampm}`;
        };

        currentChat.lastTime = updateTime();

        // رندر آنی پیام ادمین روی صفحه
        renderActiveChat();
        renderChatList();

        // خالی کردن و فوکوس روی اینپوت
        msgInput.value = '';
        msgInput.focus();

        // ۲. شروع فرآیند پاسخ خودکار هوشمند (شبیه‌سازی کاربر واقعی)
        setTimeout(() => {
            // الف) تغییر وضعیت مخاطب در هدر به حالت در حال تایپ
            const statusSpan = activeChatHeader.querySelector('h4 span');
            if (statusSpan) {
                statusSpan.innerText = "typing...";
                statusSpan.style.color = "#25d366"; // سبز شدن متن تایپینگ
            }

            // ب) رندر حباب سه‌نقطه متحرک در انتهای بدنه چت
            const typingIndicator = document.createElement('div');
            typingIndicator.className = "msg incoming";
            typingIndicator.id = "typingIndicatorBox";
            typingIndicator.innerHTML = `
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            `;
            chatMessageBody.appendChild(typingIndicator);
            chatMessageBody.scrollTop = chatMessageBody.scrollHeight; // اسکرول نرم به پایین

            // ۳. پس از ۲ ثانیه تایپ کردن، پیام واقعی مخاطب ظاهر شود
            setTimeout(() => {
                // حذف حباب سه‌نقطه متحرک
                const indicator = document.getElementById('typingIndicatorBox');
                if (indicator) indicator.remove();

                // برگرداندن وضعیت مخاطب به حالت آنلاین
                if (statusSpan) {
                    statusSpan.innerText = currentChat.status;
                    statusSpan.style.color = ""; // برگشت به رنگ اصلی
                }

                // انتخاب یک پاسخ تصادفی از بانک جملات
                const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];

                // اضافه کردن پیام دریافتی به آرایه داده‌ها
                currentChat.messages.push({
                    text: randomReply,
                    type: "incoming"
                });

                currentChat.lastTime = updateTime();

                // رندر نهایی و نوسازی کامل چت
                renderActiveChat();
                renderChatList();

            }, 2000); // زمان تایپ کردن (۲ ثانیه)

        }, 800); // تاخیر اولیه کوچک قبل از شروع تایپ (۸۰۰ میلی‌ثانیه)
    }
}


// گوش به زنگ برای کلیک روی دکمه موشک (ارسال)
if (sendMsgBtn) {
    sendMsgBtn.addEventListener('click', sendMessage);
}

// گوش به زنگ برای فشردن کلید Enter روی کیبورد جهت ارسال سریع‌تر
if (msgInput) {
    msgInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // جلوگیری از رفتار پیش‌فرض خط جدید
            sendMessage();
        }
    });
}


// ==================== بخش تنظیمات: پروفایل، سیستم و تغییر رمز عبور ====================

// ۱. منطق پنهان/آشکار کردن پسورد (آیکون چشم)
const togglePasswordIcons = document.querySelectorAll('.togglePassword');

togglePasswordIcons.forEach(icon => {
    icon.addEventListener('click', function () {
        // پیدا کردن اینپوت پسورد در همان باکس
        const passwordInput = this.parentElement.querySelector('input');

        if (passwordInput) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                // تغییر آیکون به چشم خط‌خورده
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                // برگشت به آیکون چشم معمولی
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            }
        }
    });
});


// ۲. منطق پیش‌نمایش آنی تصویر پروفایل جدید
const imageFileInput = document.getElementById('imageFile');
const profileimagePreview = document.getElementById('profileimagePreview');
const profileFieldIds = ['profFirstName', 'profLastName', 'profEmail', 'profPhone'];

function loadSettings() {
    const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');

    profileFieldIds.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && savedSettings[fieldId] !== undefined) {
            field.value = savedSettings[fieldId];
        }
    });

    const emailNotifications = document.getElementById('sysEmailNotif');
    const maintenanceMode = document.getElementById('sysMaintMode');
    if (emailNotifications && savedSettings.sysEmailNotif !== undefined) {
        emailNotifications.checked = savedSettings.sysEmailNotif;
    }
    if (maintenanceMode && savedSettings.sysMaintMode !== undefined) {
        maintenanceMode.checked = savedSettings.sysMaintMode;
    }

    if (profileimagePreview && savedSettings.profileImage) {
        profileimagePreview.src = savedSettings.profileImage;
    }
}

if (imageFileInput && profileimagePreview) {
    imageFileInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();

            reader.onload = function (e) {
                // آپدیت کردن تصویر آواتار در صفحه تنظیمات
                profileimagePreview.src = e.target.result;

                const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');
                savedSettings.profileImage = e.target.result;
                localStorage.setItem(settingsStorageKey, JSON.stringify(savedSettings));

                // آپدیت کردن همزمان تصویر کوچک ادمین در تاپ‌بار (Topbar) در صورت وجود
                const topbarUserImg = document.querySelector('.topbar .user img');
                if (topbarUserImg) {
                    topbarUserImg.src = e.target.result;
                }
            };

            reader.readAsDataURL(this.files[0]);
        }
    });
}


// ۳. منطق دکمه ثبت تغییرات پروفایل (Profile Settings)
const profileSettingsForm = document.getElementById('profileSettingsForm');

if (profileSettingsForm) {
    loadSettings();
}

if (profileSettingsForm) {
    profileSettingsForm.addEventListener('submit', function (event) {
        event.preventDefault(); // جلوگیری از رفرش صفحه

        const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');
        profileFieldIds.forEach(fieldId => {
            savedSettings[fieldId] = document.getElementById(fieldId).value;
        });
        savedSettings.sysEmailNotif = document.getElementById('sysEmailNotif').checked;
        savedSettings.sysMaintMode = document.getElementById('sysMaintMode').checked;
        localStorage.setItem(settingsStorageKey, JSON.stringify(savedSettings));
        applySavedProfileImage();

        // نمایش پاپ‌آپ موفقیت با SweetAlert2 شیک
        Swal.fire({
            title: 'Saved!',
            text: 'Profile settings updated successfully.',
            icon: 'success',
            confirmButtonColor: '#384827',
            timer: 2000
        });
    });
}


// ۴. منطق دکمه ثبت تغییرات رمز عبور (Change Password)
const passwordSettingsForm = document.getElementById('passwordSettingsForm');

if (passwordSettingsForm) {
    passwordSettingsForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const currentPass = document.getElementById('currentPassword').value.trim();
        const newPass = document.getElementById('newPassword').value.trim();

        // اعتبارسنجی اولیه: فیلدها خالی نباشند
        if (currentPass === '' || newPass === '') {
            Swal.fire({
                title: 'Error!',
                text: 'Please fill in all password fields.',
                icon: 'error',
                confirmButtonColor: '#af0b3f'
            });
            return;
        }

        const savedSettings = JSON.parse(localStorage.getItem(settingsStorageKey) || '{}');
        savedSettings.password = newPass;
        localStorage.setItem(settingsStorageKey, JSON.stringify(savedSettings));

        // پاپ‌آپ موفقیت‌آمیز تغییر پسورد
        Swal.fire({
            title: 'Password Updated!',
            text: 'Your security password has been changed.',
            icon: 'success',
            confirmButtonColor: '#384827',
            timer: 2000
        });

        // خالی کردن فیلدهای پسورد پس از ثبت موفق
        passwordSettingsForm.reset();
    });
}

// ==================== بخش راهنما و پشتیبانی (Help Center) ====================

// ۱. منطق باز و بسته شدن آکاردئونی سوالات متداول (FAQ)
const faqQuestions = document.querySelectorAll('.faqQuestion');

faqQuestions.forEach(question => {
    question.addEventListener('click', function () {
        // پیدا کردن تگ کل آیتم سوال فعلی
        const currentItem = this.parentElement;

        // سناریو فرعی: بستن سایر سوالات باز شده (حالت آکاردئون تکی)
        document.querySelectorAll('.faqItem').forEach(item => {
            if (item !== currentItem) {
                item.classList.remove('activeFaq');
            }
        });

        // سناریو اصلی: اگر کلاس activeFaq را داشت پاک کند، اگر نداشت اضافه کند (Toggle)
        currentItem.classList.toggle('activeFaq');
    });
});


// ۲. منطق دکمه‌های کارت‌های پشتیبانی سریع با SweetAlert2
// ۲. نسخه ارتقا یافته دکمه‌های کارت‌های پشتیبانی + قابلیت چاپ گزارشات سیستم
const helpCardsContainer = document.querySelector('.helpCards');

if (helpCardsContainer) {
    helpCardsContainer.addEventListener('click', function (e) {
        const clickedBtn = e.target.closest('.hBtn');

        if (clickedBtn) {
            e.preventDefault();

            const parentCard = clickedBtn.closest('.hCard');
            if (!parentCard) return;

            const cardTitle = parentCard.querySelector('h3').innerText.trim().toLowerCase();

            // الف) کارت مستندات
            if (cardTitle.includes('documentation')) {
                Swal.fire({
                    title: 'Loading Documentation...',
                    text: 'Redirecting you to the system admin guides.',
                    icon: 'info',
                    confirmButtonColor: '#384827',
                    timer: 2000
                });
            }

            // ب) کارت پشتیبانی تیکت
            else if (cardTitle.includes('support')) {
                Swal.fire({
                    title: 'Open Technical Ticket',
                    input: 'textarea',
                    inputPlaceholder: 'Type your support request message here...',
                    showCancelButton: true,
                    confirmButtonColor: '#384827',
                    cancelButtonColor: '#999',
                    confirmButtonText: 'Send Ticket',
                    cancelButtonText: 'Cancel'
                }).then((result) => {
                    if (result.isConfirmed && result.value && result.value.trim() !== '') {
                        Swal.fire({
                            title: 'Ticket Sent!',
                            text: 'Our technical support team will contact you shortly.',
                            icon: 'success',
                            confirmButtonColor: '#384827',
                            timer: 2000
                        });
                    }
                });
            }

            // ج) کارت گزارش باگ
            else if (cardTitle.includes('bug')) {
                Swal.fire({
                    title: 'Report Panel Bug',
                    text: 'Thank you for keeping the panel safe. Our developers will debug this.',
                    icon: 'success',
                    confirmButtonColor: '#384827',
                    timer: 2000
                });
            }

            // د) کارت جدید: عملیات پرینت و چاپ گزارشات سیستم (Print All)
            else if (cardTitle.includes('print')) {
                const report = document.createElement('section');
                report.className = 'printReport';

                const ordersMarkup = ordersData.map(order => `
                    <tr>
                        <td>${order.name}</td>
                        <td>${order.price}</td>
                        <td>${order.payment}</td>
                        <td>${order.status}</td>
                    </tr>
                `).join('');

                const customersMarkup = customersData.map(customer => `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.totalSpent}</td>
                        <td>${customer.status}</td>
                    </tr>
                `).join('');

                report.innerHTML = `
                    <h1>Admin Panel Report</h1>
                    <p class="printDate">Generated: ${new Date().toLocaleString()}</p>
                    <h2>Summary</h2>
                    <div class="printSummary">
                        <p><strong>Daily Views:</strong> ${dashboardStats.dailyViews}</p>
                        <p><strong>Total Sales:</strong> ${ordersData.length}</p>
                        <p><strong>Comments:</strong> ${dashboardStats.comments}</p>
                        <p><strong>Earning:</strong> ${dashboardStats.earning}</p>
                    </div>
                    <h2>Recent Orders</h2>
                    <table>
                        <thead><tr><th>Name</th><th>Price</th><th>Payment</th><th>Status</th></tr></thead>
                        <tbody>${ordersMarkup}</tbody>
                    </table>
                    <h2>Customers</h2>
                    <table>
                        <thead><tr><th>Name</th><th>Email</th><th>Total Spent</th><th>Status</th></tr></thead>
                        <tbody>${customersMarkup}</tbody>
                    </table>
                `;

                document.body.appendChild(report);
                window.addEventListener('afterprint', () => report.remove(), { once: true });
                window.print();
            }
        }
    });
}

