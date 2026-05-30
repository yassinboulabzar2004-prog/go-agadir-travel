document.addEventListener('DOMContentLoaded', () => {
    const mobileMenu = document.querySelector('.home-mobile-menu');
    const mobileMenuToggle = document.querySelector('.home-menu-toggle, .product-mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.home-menu-close');

    if (mobileMenu && mobileMenuToggle && mobileMenuClose) {
        const setMobileMenu = (isOpen) => {
            mobileMenu.classList.toggle('is-open', isOpen);
            mobileMenu.setAttribute('aria-hidden', String(!isOpen));
            mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
            document.body.classList.toggle('is-menu-open', isOpen);
        };

        mobileMenuToggle.addEventListener('click', () => setMobileMenu(true));
        mobileMenuClose.addEventListener('click', () => setMobileMenu(false));

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => setMobileMenu(false));
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setMobileMenu(false);
            }
        });
    }

    const bookingPopup = document.querySelector('.product-body .product-right');
    const bookingPopupOpen = document.querySelector('.mobile-booking-trigger');
    const bookingPopupClose = document.querySelector('.booking-popup-close');
    const bookingPopupBackdrop = document.querySelector('.booking-popup-backdrop');

    if (bookingPopup && bookingPopupOpen && bookingPopupClose && bookingPopupBackdrop) {
        const setBookingPopup = (isOpen) => {
            document.body.classList.toggle('is-booking-popup-open', isOpen);
            bookingPopup.setAttribute('aria-hidden', String(!isOpen));
            bookingPopupOpen.setAttribute('aria-expanded', String(isOpen));
            bookingPopupBackdrop.setAttribute('aria-hidden', String(!isOpen));
        };

        bookingPopup.setAttribute('aria-hidden', 'true');
        bookingPopupOpen.addEventListener('click', () => setBookingPopup(true));
        bookingPopupClose.addEventListener('click', () => setBookingPopup(false));
        bookingPopupBackdrop.addEventListener('click', () => setBookingPopup(false));

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                setBookingPopup(false);
            }
        });
    }

    document.querySelectorAll('[data-expandable]').forEach((block) => {
        const toggle = block.querySelector('[data-expand-toggle]');

        if (!toggle) {
            return;
        }

        toggle.addEventListener('click', (event) => {
            event.preventDefault();
            const isExpanded = block.classList.toggle('is-expanded');
            toggle.textContent = isExpanded ? 'Show less' : 'Show more';
        });
    });

    const galleryButtons = document.querySelectorAll('.gallery-more button, .gallery-mobile-more');
    const galleryImages = document.querySelectorAll('.product-gallery img');
    const galleryLightbox = document.querySelector('[data-gallery-lightbox]');
    const galleryCurrent = document.querySelector('[data-gallery-current]');
    const galleryCount = document.querySelector('[data-gallery-count]');
    const galleryClose = document.querySelector('[data-gallery-close]');
    const galleryPrev = document.querySelector('[data-gallery-prev]');
    const galleryNext = document.querySelector('[data-gallery-next]');

    if (galleryButtons.length && galleryLightbox && galleryCurrent && galleryCount) {
        const photos = Array.from(galleryImages)
            .map((image) => ({
                src: image.getAttribute('src'),
                alt: image.getAttribute('alt') || 'Agadir tour photo'
            }))
            .filter((photo, index, list) => {
                return photo.src && list.findIndex((item) => item.src === photo.src) === index;
            });

        let activePhoto = 0;

        const showPhoto = (index) => {
            if (!photos.length) {
                return;
            }

            activePhoto = (index + photos.length) % photos.length;
            galleryCurrent.src = photos[activePhoto].src;
            galleryCurrent.alt = photos[activePhoto].alt;
            galleryCount.textContent = `${activePhoto + 1} / ${photos.length}`;
        };

        const openGallery = (index = 0) => {
            showPhoto(index);
            galleryLightbox.classList.add('is-open');
            galleryLightbox.setAttribute('aria-hidden', 'false');
            document.body.classList.add('is-gallery-open');
        };

        const closeGallery = () => {
            galleryLightbox.classList.remove('is-open');
            galleryLightbox.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('is-gallery-open');
        };

        const changePhoto = (step) => {
            showPhoto(activePhoto + step);
        };

        galleryButtons.forEach((button) => {
            button.addEventListener('click', () => openGallery(0));
        });
        galleryImages.forEach((image) => {
            const imageIndex = photos.findIndex((photo) => photo.src === image.getAttribute('src'));

            image.addEventListener('click', () => openGallery(Math.max(imageIndex, 0)));
            image.setAttribute('tabindex', '0');
            image.setAttribute('role', 'button');
            image.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openGallery(Math.max(imageIndex, 0));
                }
            });
        });
        galleryClose?.addEventListener('click', closeGallery);
        galleryPrev?.addEventListener('click', () => changePhoto(-1));
        galleryNext?.addEventListener('click', () => changePhoto(1));

        galleryLightbox.addEventListener('click', (event) => {
            if (event.target === galleryLightbox) {
                closeGallery();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (!galleryLightbox.classList.contains('is-open')) {
                return;
            }

            if (event.key === 'Escape') {
                closeGallery();
            }

            if (event.key === 'ArrowLeft') {
                changePhoto(-1);
            }

            if (event.key === 'ArrowRight') {
                changePhoto(1);
            }
        });
    }

    const filterControls = document.querySelectorAll('[data-style-filter]');
    const tourCards = document.querySelectorAll('[data-tour-category]');

    if (filterControls.length && tourCards.length) {
        const setTourFilter = (filter) => {
            const activeFilter = filter === 'all' ? 'all' : filter;

            filterControls.forEach((control) => {
                control.classList.toggle('is-active', control.dataset.styleFilter === activeFilter);
            });

            tourCards.forEach((card) => {
                const categories = (card.dataset.tourCategory || '').split(' ');
                const isVisible = activeFilter === 'all' || categories.includes(activeFilter);
                card.classList.toggle('is-filtered-out', !isVisible);
            });

            document.querySelector('#tours')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };

        filterControls.forEach((control) => {
            control.addEventListener('click', () => {
                setTourFilter(control.dataset.styleFilter);
            });

            control.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setTourFilter(control.dataset.styleFilter);
                }
            });
        });
    }

    document.querySelectorAll('.home-tour-card').forEach((card) => {
        const cardLink = card.querySelector('.tour-image[href]');

        if (!cardLink) {
            return;
        }

        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');

        const openCard = () => {
            window.location.href = cardLink.href;
        };

        card.addEventListener('click', (event) => {
            if (event.target.closest('a, button, input, select, textarea')) {
                return;
            }

            openCard();
        });

        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                openCard();
            }
        });
    });

    document.querySelectorAll('.guest-picker').forEach((picker) => {
        const toggle = picker.querySelector('.guest-toggle');
        const summary = picker.querySelector('.guest-summary');
        const continueBtn = picker.querySelector('.guest-continue');
        const counts = {
            adult: 1,
            child: 0
        };

        const update = () => {
            picker.querySelector('[data-count="adult"]').textContent = counts.adult;
            picker.querySelector('[data-count="child"]').textContent = counts.child;

            picker.querySelector('[data-action="minus"][data-target="adult"]').disabled = counts.adult <= 1;
            picker.querySelector('[data-action="minus"][data-target="child"]').disabled = counts.child <= 0;

            const childText = counts.child > 0 ? `, Child x ${counts.child}` : '';
            summary.textContent = `Adult x ${counts.adult}${childText}`;
        };

        toggle.addEventListener('click', () => {
            const isOpen = picker.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        picker.querySelectorAll('[data-action]').forEach((button) => {
            button.addEventListener('click', () => {
                const target = button.dataset.target;
                const action = button.dataset.action;

                if (action === 'plus') {
                    counts[target] += 1;
                }

                if (action === 'minus') {
                    const min = target === 'adult' ? 1 : 0;
                    counts[target] = Math.max(min, counts[target] - 1);
                }

                update();
            });
        });

        continueBtn.addEventListener('click', () => {
            picker.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });

        update();
    });

    document.querySelectorAll('.date-picker').forEach((picker) => {
        const toggle = picker.querySelector('.date-toggle');
        const summary = picker.querySelector('.date-summary');
        const clear = picker.querySelector('.date-clear');
        const today = picker.querySelector('.date-today');
        const prev = picker.querySelector('.date-prev');
        const next = picker.querySelector('.date-next');
        const monthTitle = picker.querySelector('.luxe-date-head h4');
        const daysGrid = picker.querySelector('.luxe-days');
        const todayDate = new Date(2026, 4, 26);
        let visibleMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
        let selectedDate = null;

        if (!picker.querySelector('.date-error')) {
            const error = document.createElement('p');
            error.className = 'date-error';
            error.textContent = 'Please select a tour date first.';
            picker.appendChild(error);
        }

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const formatDate = (date) => {
            return `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        };

        const renderCalendar = () => {
            const year = visibleMonth.getFullYear();
            const month = visibleMonth.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startOffset = (firstDay.getDay() + 6) % 7;

            monthTitle.textContent = `${monthNames[month]} ${year}`;
            daysGrid.innerHTML = '';

            for (let i = 0; i < startOffset; i += 1) {
                const empty = document.createElement('span');
                empty.className = 'is-empty';
                daysGrid.appendChild(empty);
            }

            for (let day = 1; day <= lastDay.getDate(); day += 1) {
                const date = new Date(year, month, day);
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = day;
                button.dataset.date = formatDate(date);

                if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                    button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                    selectedDate = date;
                    summary.textContent = formatDate(date);
                    picker.classList.remove('needs-date');
                    picker.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    renderCalendar();
                });

                daysGrid.appendChild(button);
            }
        };

        toggle.addEventListener('click', () => {
            const isOpen = picker.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        prev.addEventListener('click', () => {
            visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
            renderCalendar();
        });

        next.addEventListener('click', () => {
            visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
            renderCalendar();
        });

        clear.addEventListener('click', () => {
            selectedDate = null;
            summary.textContent = 'Select date';
            picker.classList.remove('needs-date');
            picker.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            renderCalendar();
        });

        today.addEventListener('click', () => {
            visibleMonth = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
            selectedDate = new Date(todayDate);
            summary.textContent = formatDate(todayDate);
            picker.classList.remove('needs-date');
            picker.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
            renderCalendar();
        });

        renderCalendar();
    });

    document.querySelectorAll('.product-body .book-btn[href]').forEach((button) => {
        button.addEventListener('click', (event) => {
            const bookingBox = button.closest('.booking-box');
            const picker = bookingBox ? bookingBox.querySelector('.date-picker') : null;
            const summary = picker ? picker.querySelector('.date-summary') : null;
            const guestSummary = bookingBox ? bookingBox.querySelector('.guest-summary') : null;
            const selectedDate = summary ? summary.textContent.trim() : '';
            const guestText = guestSummary ? guestSummary.textContent.trim() : 'Adult x 1';
            const adultMatch = guestText.match(/Adult x (\d+)/);
            const childMatch = guestText.match(/Child x (\d+)/);
            const adults = adultMatch ? Number(adultMatch[1]) : 1;
            const children = childMatch ? Number(childMatch[1]) : 0;

            if (!picker || !summary) {
                return;
            }

            if (!selectedDate || selectedDate === 'Select date') {
                event.preventDefault();
                picker.classList.add('needs-date', 'is-open');
                picker.querySelector('.date-toggle').setAttribute('aria-expanded', 'true');
                picker.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            event.preventDefault();
            window.location.href = `${button.getAttribute('href')}?date=${encodeURIComponent(selectedDate)}&adults=${adults}&children=${children}`;
        });
    });

    document.querySelectorAll('.language-picker').forEach((picker) => {
        const toggle = picker.querySelector('.language-toggle');
        const summary = picker.querySelector('.language-summary');

        toggle.addEventListener('click', () => {
            const isOpen = picker.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        picker.querySelectorAll('[data-language]').forEach((button) => {
            button.addEventListener('click', () => {
                picker.querySelectorAll('[data-language]').forEach((option) => {
                    option.classList.remove('is-selected');
                });

                button.classList.add('is-selected');
                summary.textContent = button.dataset.language;
                picker.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    });

    document.querySelectorAll('[data-share]').forEach((button) => {
        button.addEventListener('click', async () => {
            const originalText = button.textContent;
            const shareData = {
                title: document.title,
                url: window.location.href
            };

            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                    return;
                }

                await navigator.clipboard.writeText(window.location.href);
                button.textContent = 'Copied';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 1800);
            } catch (error) {
                button.textContent = originalText;
            }
        });
    });

    const checkoutCard = document.querySelector('.checkout-config-card');
    if (checkoutCard) {
        const dateToggle = document.querySelector('[data-checkout-date-toggle]');
        const dateText = document.querySelector('[data-checkout-date]');
        const summaryDate = document.querySelector('[data-summary-date]');
        const summaryTime = document.querySelector('[data-summary-time]');
        const summaryCategory = document.querySelector('[data-summary-category]');
        const summaryCore = document.querySelector('[data-summary-core]');
        const summaryTotal = document.querySelector('[data-summary-total]');
        const summaryTravelers = document.querySelector('[data-summary-travelers]');
        const monthTitle = document.querySelector('[data-checkout-month]');
        const daysGrid = document.querySelector('[data-checkout-days]');
        const prevMonth = document.querySelector('[data-checkout-prev]');
        const nextMonth = document.querySelector('[data-checkout-next]');
        const clearDate = document.querySelector('[data-checkout-clear]');
        const todayButton = document.querySelector('[data-checkout-today]');
        const previousStep = document.querySelector('[data-previous-step]');
        const nextStep = document.querySelector('[data-next-step]');
        const checkoutLayout = document.querySelector('.checkout-layout');
        const checkoutActions = document.querySelector('.checkout-actions');
        const addonCards = document.querySelectorAll('[data-addon-card]');
        const summaryAddonRow = document.querySelector('[data-summary-addon-row]');
        const summaryAddon = document.querySelector('[data-summary-addon]');
        const today = new Date(2026, 4, 26);
        const requestedDate = new URLSearchParams(window.location.search).get('date');
        const params = new URLSearchParams(window.location.search);
        const checkoutAdults = Math.max(1, Number(params.get('adults')) || 1);
        const checkoutChildren = Math.max(0, Number(params.get('children')) || 0);
        const checkoutPax = checkoutAdults + checkoutChildren;
        const parsedDate = requestedDate ? new Date(requestedDate) : null;
        let selectedDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : new Date(2026, 0, 9);
        let visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        let checkoutStep = 1;
        let corePrice = 18 * checkoutPax;
        let addonPrice = 0;

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const formatDate = (date) => `${monthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        const formatShortDate = (date) => `${monthNames[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
        const formatCheckoutPrice = (price) => `€${price}`;

        const syncCheckoutTotal = () => {
            const selectedAddons = Array.from(addonCards).filter((card) => card.classList.contains('is-added'));
            addonPrice = selectedAddons.reduce((total, card) => {
                const unitPrice = Number(card.dataset.addonPrice) || 0;
                const adultCount = Number(card.dataset.addonAdult || 1);
                const childCount = Number(card.dataset.addonChild || 0);
                return total + (unitPrice * (adultCount + childCount));
            }, 0);

            if (summaryCore) {
                summaryCore.textContent = formatCheckoutPrice(corePrice);
            }

            if (summaryTravelers) {
                summaryTravelers.textContent = `${checkoutPax} ${checkoutPax === 1 ? 'pax' : 'pax'}`;
            }

            if (summaryTotal) {
                summaryTotal.textContent = formatCheckoutPrice(corePrice + addonPrice);
            }

            if (summaryAddonRow) {
                summaryAddonRow.classList.toggle('is-hidden', selectedAddons.length === 0);
            }

            if (summaryAddon) {
                summaryAddon.textContent = selectedAddons.length > 0
                    ? selectedAddons.map((card) => {
                        const count = (Number(card.dataset.addonAdult || 1) + Number(card.dataset.addonChild || 0));
                        return `${card.dataset.addonName} x ${count}`;
                    }).join(', ')
                    : 'None';
            }
        };

        const showCheckoutStep = (step) => {
            checkoutStep = step;

            if (checkoutLayout) {
                checkoutLayout.dataset.currentStep = String(step);
            }

            document.querySelectorAll('[data-step-panel]').forEach((panel) => {
                panel.classList.toggle('is-active', panel.dataset.stepPanel === String(step));
            });

            document.querySelectorAll('[data-checkout-step]').forEach((item) => {
                const itemStep = Number(item.dataset.checkoutStep);
                item.classList.toggle('is-active', itemStep === step);
                item.classList.toggle('is-done', itemStep < step);

                const bubble = item.querySelector('span');
                if (bubble) {
                    bubble.textContent = itemStep < step ? '✓' : item.dataset.checkoutStep;
                }
            });

            if (nextStep) {
                nextStep.innerHTML = step === 3 ? 'Request Booking &#8250;' : 'Continue &#8250;';
            }
        };

        const validateLeadDetails = () => {
            const leadNameInput = document.querySelector('[data-lead-field="name"]');
            const leadEmailInput = document.querySelector('[data-lead-field="email"]');
            const leadWhatsappInput = document.querySelector('[data-lead-field="whatsapp"]');
            const pickupInput = document.querySelector('[data-lead-field="pickupLocation"]');
            const pickupChoiceBox = document.querySelector('.pickup-choice');
            const selectedPickup = document.querySelector('[data-pickup-choice]:checked');
            const wantsPickup = selectedPickup?.value === "I'd like to be picked up";
            const requiredFields = [leadNameInput, leadEmailInput, leadWhatsappInput];
            let firstInvalid = null;

            requiredFields.forEach((field) => field?.classList.remove('is-invalid'));
            pickupInput?.classList.remove('is-invalid');
            pickupChoiceBox?.classList.remove('is-invalid');

            requiredFields.forEach((field) => {
                if (!field?.value.trim()) {
                    field?.classList.add('is-invalid');
                    firstInvalid = firstInvalid || field;
                }
            });

            if (leadEmailInput?.value.trim() && !leadEmailInput.value.includes('@')) {
                leadEmailInput.classList.add('is-invalid');
                firstInvalid = firstInvalid || leadEmailInput;
            }

            if (!selectedPickup) {
                pickupChoiceBox?.classList.add('is-invalid');
                firstInvalid = firstInvalid || pickupChoiceBox;
            }

            if (wantsPickup && !pickupInput?.value.trim()) {
                pickupInput?.classList.add('is-invalid');
                document.querySelector('[data-pickup-required]')?.classList.remove('is-hidden');
                firstInvalid = firstInvalid || pickupInput;
            }

            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstInvalid.focus?.();
                return false;
            }

            return true;
        };

        const syncDate = () => {
            const value = formatShortDate(selectedDate);
            dateText.textContent = value;
            summaryDate.textContent = value;
        };

        const renderCheckoutCalendar = () => {
            const year = visibleMonth.getFullYear();
            const month = visibleMonth.getMonth();
            const first = new Date(year, month, 1);
            const last = new Date(year, month + 1, 0);
            const offset = (first.getDay() + 6) % 7;

            monthTitle.textContent = `${monthNames[month]} ${year}`;
            daysGrid.innerHTML = '';

            for (let i = 0; i < offset; i += 1) {
                const empty = document.createElement('span');
                empty.className = 'is-empty';
                daysGrid.appendChild(empty);
            }

            for (let day = 1; day <= last.getDate(); day += 1) {
                const date = new Date(year, month, day);
                const button = document.createElement('button');
                button.type = 'button';
                button.textContent = day;

                if (date.toDateString() === selectedDate.toDateString()) {
                    button.classList.add('is-selected');
                }

                button.addEventListener('click', () => {
                    selectedDate = date;
                    syncDate();
                    checkoutCard.classList.remove('is-date-open');
                    renderCheckoutCalendar();
                });

                daysGrid.appendChild(button);
            }
        };

        dateToggle.addEventListener('click', () => {
            checkoutCard.classList.toggle('is-date-open');
        });

        prevMonth.addEventListener('click', () => {
            visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
            renderCheckoutCalendar();
        });

        nextMonth.addEventListener('click', () => {
            visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
            renderCheckoutCalendar();
        });

        clearDate.addEventListener('click', () => {
            checkoutCard.classList.remove('is-date-open');
        });

        todayButton.addEventListener('click', () => {
            selectedDate = new Date(today);
            visibleMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            syncDate();
            checkoutCard.classList.remove('is-date-open');
            renderCheckoutCalendar();
        });

        document.querySelectorAll('[data-time]').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('[data-time]').forEach((time) => time.classList.remove('is-selected'));
                button.classList.add('is-selected');
                summaryTime.textContent = button.dataset.time;
            });
        });

        document.querySelectorAll('[data-tour-option]').forEach((option) => {
            const selectOption = () => {
                document.querySelectorAll('[data-tour-option]').forEach((item) => item.classList.remove('is-selected'));
                option.classList.add('is-selected');
                summaryCategory.textContent = option.dataset.tourOption;
                corePrice = option.dataset.tourOption === 'Shared Tour'
                    ? 18 * checkoutPax
                    : Number(option.dataset.price) || 0;
                if (summaryCore) {
                    summaryCore.textContent = formatCheckoutPrice(corePrice);
                }
                if (summaryTotal) {
                    summaryTotal.textContent = formatCheckoutPrice(corePrice + addonPrice);
                }
            };

            option.addEventListener('click', selectOption);
            option.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectOption();
                }
            });
        });

        if (nextStep) {
            nextStep.addEventListener('click', async () => {
                if (checkoutStep === 1) {
                    showCheckoutStep(2);
                    checkoutCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }

                if (checkoutStep === 2) {
                    showCheckoutStep(3);
                    checkoutCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    return;
                }

                if (checkoutStep === 3) {
                    if (!validateLeadDetails()) {
                        return;
                    }

                    const leadName = document.querySelector('[data-lead-field="name"]')?.value.trim() || '';
                    const leadEmail = document.querySelector('[data-lead-field="email"]')?.value.trim() || '';
                    const leadWhatsappCountry = document.querySelector('[data-lead-field="whatsappCountry"]')?.value || '+212';
                    const leadWhatsapp = document.querySelector('[data-lead-field="whatsapp"]')?.value.trim() || '';
                    const leadNotes = document.querySelector('[data-lead-field="notes"]')?.value.trim() || 'None';
                    const pickupChoice = document.querySelector('[data-pickup-choice]:checked')?.value || 'Not selected';
                    const pickupLocation = document.querySelector('[data-lead-field="pickupLocation"]')?.value.trim() || '';
                    const selectedAddonData = Array.from(addonCards)
                        .filter((card) => card.classList.contains('is-added'))
                        .map((card) => {
                            const adult = Number(card.dataset.addonAdult || 1);
                            const child = Number(card.dataset.addonChild || 0);
                            const pax = adult + child;
                            const unitPrice = Number(card.dataset.addonPrice || 0);

                            return {
                                name: card.dataset.addonName,
                                adult,
                                child,
                                pax,
                                unitPrice,
                                total: unitPrice * pax
                            };
                        });

                    const whatsappCountrySelect = document.querySelector('[data-lead-field="whatsappCountry"]');
                    const activityTitle = document.querySelector('.checkout-summary-card h2')?.textContent.trim()
                        || 'Agadir: Sandboarding Guided Experience & Visit to the Canyon';

                    const bookingPayload = {
                        customer: {
                            name: leadName,
                            email: leadEmail,
                            whatsappCountry: whatsappCountrySelect?.selectedOptions?.[0]?.textContent.trim() || leadWhatsappCountry,
                            whatsapp: leadWhatsapp,
                            notes: leadNotes
                        },
                        booking: {
                            activity: activityTitle,
                            date: summaryDate ? summaryDate.textContent : '',
                            time: summaryTime ? summaryTime.textContent : '',
                            travelers: summaryTravelers ? summaryTravelers.textContent : '',
                            adults: checkoutAdults,
                            children: checkoutChildren,
                            option: summaryCategory ? summaryCategory.textContent : '',
                            pickup: {
                                choice: pickupChoice,
                                location: pickupLocation
                            },
                            addons: selectedAddonData,
                            corePrice,
                            addonPrice,
                            totalPrice: corePrice + addonPrice,
                            totalText: summaryTotal ? summaryTotal.textContent : ''
                        }
                    };

                    const originalButtonText = nextStep.innerHTML;
                    nextStep.disabled = true;
                    nextStep.innerHTML = 'Sending request...';

                    try {
                        const response = await fetch("https://go-agadir-travel.onrender.com/send-booking", {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(bookingPayload)
                        });
                        const result = await response.json().catch(() => ({}));

                        if (!response.ok || !result.ok) {
                            throw new Error(result.message || 'Could not send booking request.');
                        }

                        sessionStorage.setItem('lastBookingRequest', JSON.stringify({
                            ...bookingPayload,
                            bookingId: result.bookingId
                        }));
                        window.location.href = `confirmation.html?booking=${encodeURIComponent(result.bookingId)}`;
                    } catch (error) {
                        nextStep.disabled = false;
                        nextStep.innerHTML = originalButtonText;
                        alert(`${error.message} Please make sure the booking server is running.`);
                    }
                }
            });
        }

        if (previousStep) {
            previousStep.addEventListener('click', () => {
                if (checkoutStep === 1) {
                    window.location.href = 'product.html';
                    return;
                }

                showCheckoutStep(checkoutStep - 1);
                checkoutCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        addonCards.forEach((card) => {
            const toggle = card.querySelector('[data-addon-toggle]');
            card.dataset.addonAdult = card.dataset.addonAdult || '1';
            card.dataset.addonChild = card.dataset.addonChild || '0';

            const syncAddonCounts = () => {
                const adultValue = card.querySelector('[data-addon-value="adult"]');
                const childValue = card.querySelector('[data-addon-value="child"]');
                const addonTotal = card.querySelector('[data-addon-total]');
                const adultMinus = card.querySelector('[data-addon-count="minus"][data-addon-target="adult"]');
                const childMinus = card.querySelector('[data-addon-count="minus"][data-addon-target="child"]');
                const unitPrice = Number(card.dataset.addonPrice) || 0;
                const adultCount = Number(card.dataset.addonAdult || 1);
                const childCount = Number(card.dataset.addonChild || 0);
                const totalGuests = adultCount + childCount;

                if (adultValue) {
                    adultValue.textContent = adultCount;
                }

                if (childValue) {
                    childValue.textContent = childCount;
                }

                if (adultMinus) {
                    adultMinus.disabled = adultCount <= 1;
                }

                if (childMinus) {
                    childMinus.disabled = childCount <= 0;
                }

                if (addonTotal) {
                    addonTotal.innerHTML = `${formatCheckoutPrice(unitPrice * totalGuests)} <small>/ ${totalGuests} pax</small>`;
                }
            };

            if (!toggle) {
                return;
            }

            toggle.addEventListener('click', () => {
                const added = card.classList.toggle('is-added');
                toggle.textContent = added ? 'Added' : 'Add to trip';
                syncAddonCounts();
                syncCheckoutTotal();
            });

            card.querySelectorAll('[data-addon-count]').forEach((button) => {
                button.addEventListener('click', () => {
                    const target = button.dataset.addonTarget;
                    const action = button.dataset.addonCount;
                    const key = target === 'child' ? 'addonChild' : 'addonAdult';
                    const min = target === 'child' ? 0 : 1;
                    const currentValue = Number(card.dataset[key] || min);

                    if (action === 'plus') {
                        card.dataset[key] = String(currentValue + 1);
                    }

                    if (action === 'minus') {
                        card.dataset[key] = String(Math.max(min, currentValue - 1));
                    }

                    syncAddonCounts();
                    syncCheckoutTotal();
                });
            });

            syncAddonCounts();
        });

        document.querySelectorAll('[data-pickup-choice]').forEach((input) => {
            input.addEventListener('change', () => {
                document.querySelector('.pickup-choice')?.classList.remove('is-invalid');
                document.querySelectorAll('.pickup-option').forEach((option) => {
                    option.classList.toggle('is-selected', option.querySelector('input')?.checked);
                });

                const pickupLocation = document.querySelector('[data-pickup-location]');
                const wantsPickup = document.querySelector('[data-pickup-choice]:checked')?.value === "I'd like to be picked up";

                if (pickupLocation) {
                    pickupLocation.classList.toggle('is-visible', wantsPickup);
                }

            });
        });

        document.querySelectorAll('[data-lead-field]').forEach((field) => {
            field.addEventListener('input', () => {
                field.classList.remove('is-invalid');
            });
        });

        const pickupInput = document.querySelector('[data-lead-field="pickupLocation"]');
        const pickupPlaces = document.querySelectorAll('[data-pickup-place]');

        pickupPlaces.forEach((button) => {
            button.addEventListener('click', () => {
                if (pickupInput) {
                    pickupInput.value = button.dataset.pickupPlace;
                    pickupInput.focus();
                    pickupInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        if (pickupInput) {
            const pickupClear = pickupInput.closest('label')?.querySelector('b');
            const pickupRequired = document.querySelector('[data-pickup-required]');

            const filterPickupPlaces = () => {
                const query = pickupInput.value.trim().toLowerCase();

                pickupPlaces.forEach((button) => {
                    const haystack = button.textContent.toLowerCase();
                    const matches = query.length === 0 || haystack.includes(query);
                    button.classList.toggle('is-filtered-out', !matches);
                });

                if (pickupClear) {
                    pickupClear.textContent = query.length > 0 ? '×' : '⌕';
                    pickupClear.classList.toggle('is-clear', query.length > 0);
                }

                if (pickupRequired) {
                    pickupRequired.classList.toggle('is-hidden', query.length > 0);
                }
            };

            pickupInput.addEventListener('input', filterPickupPlaces);
            pickupInput.addEventListener('keyup', filterPickupPlaces);
            pickupInput.addEventListener('focus', filterPickupPlaces);

            if (pickupClear) {
                pickupClear.addEventListener('click', () => {
                    if (!pickupInput.value.trim()) {
                        return;
                    }

                    pickupInput.value = '';
                    pickupInput.dispatchEvent(new Event('input', { bubbles: true }));
                    pickupInput.focus();
                });
            }
        }

        syncDate();
        syncCheckoutTotal();
        showCheckoutStep(1);
        renderCheckoutCalendar();
    }

});
