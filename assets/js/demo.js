/**
 * Demo Page Script - EduSoft (demo.html)
 * Form submission interactive handler (FormSubmit AJAX to nmhoang@edusoft.vn),
 * validation, loading state, success message alert, and reset button.
 */
(function initDemoScript() {
    function initForm() {
        const demoForm = document.getElementById('demoRegisterForm');
        const successAlert = document.getElementById('formSuccessAlert');
        const resetBtn = document.getElementById('btnSuccessReset');
        const submitBtn = document.getElementById('btnDemoSubmit');

        if (demoForm) {
            demoForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // Check form validity
                if (!demoForm.checkValidity()) {
                    demoForm.reportValidity();
                    return;
                }

                // Set loading state on submit button
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = '<span>Đang gửi thông tin...</span>';
                }

                const payload = {
                    _subject: `[Edusoft Web] Đăng ký Demo từ: ${demoForm.fullName.value} (${demoForm.organization.value})`,
                    _template: 'table',
                    _captcha: 'false',
                    'Họ và tên': demoForm.fullName.value.trim(),
                    'Email liên hệ': demoForm.email.value.trim(),
                    'Số điện thoại': demoForm.phone.value.trim(),
                    'Chức vụ': demoForm.position.value,
                    'Đơn vị công tác': demoForm.organization.value.trim(),
                    'Website đơn vị': demoForm.website.value.trim(),
                    'Thời gian gửi': new Date().toLocaleString('vi-VN')
                };

                try {
                    await fetch('https://formsubmit.co/ajax/nmhoang@edusoft.vn', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (err) {
                    console.warn('FormSubmit AJAX fallback:', err);
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Nhận tư vấn giải pháp</span>';
                    }
                    // Transition to success alert
                    demoForm.style.display = 'none';
                    if (successAlert) {
                        successAlert.classList.add('show');
                    }
                }
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (demoForm) {
                    demoForm.reset();
                    demoForm.style.display = 'flex';
                }
                if (successAlert) {
                    successAlert.classList.remove('show');
                }
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initForm);
    } else {
        initForm();
    }
})();
