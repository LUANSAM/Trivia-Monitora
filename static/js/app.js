document.addEventListener('DOMContentLoaded', () => {
    hydrateVehicleFields();
    handleAvariaRepeater();
    markActiveNav();
    setupSidenav();
    setupToasts();
    setupPasswordToggles();
    setupChecklistStatus();
    setupFuelSlider();
    setupFormSubmission();
});

function setupSidenav() {
    const toggle = document.querySelector('[data-sidenav-toggle]');
    const sidenav = document.getElementById('appSidenav');
    const overlay = document.querySelector('[data-sidenav-overlay]');
    const closeBtn = document.querySelector('[data-sidenav-close]');

    if (!toggle || !sidenav || !overlay) return;

    const open = () => {
        sidenav.classList.add('is-open');
        overlay.classList.add('is-visible');
        toggle.setAttribute('aria-expanded', 'true');
        sidenav.setAttribute('aria-hidden', 'false');
        document.body.classList.add('sidenav-open');
    };

    const close = () => {
        sidenav.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        toggle.setAttribute('aria-expanded', 'false');
        sidenav.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('sidenav-open');
    };

    toggle.addEventListener('click', () => {
        const isOpen = sidenav.classList.contains('is-open');
        if (isOpen) {
            close();
        } else {
            open();
        }
    });

    overlay.addEventListener('click', close);

    if (closeBtn) {
        closeBtn.addEventListener('click', close);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidenav.classList.contains('is-open')) {
            close();
        }
    });
}

function setupToasts() {
    const stack = document.querySelector('[data-toast-stack]');
    if (!stack) return;

    const removeToast = (toast) => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 200);
    };

    stack.querySelectorAll('.toast').forEach((toast) => {
        const close = toast.querySelector('.toast-close');
        if (close) {
            close.addEventListener('click', () => removeToast(toast));
        }
        setTimeout(() => removeToast(toast), 6000);
    });
}

function hydrateVehicleFields() {
    const select = document.getElementById('veiculoSelect');
    if (!select) return;
    const modelo = document.getElementById('fieldModelo');
    const placa = document.getElementById('fieldPlaca');
    const marca = document.getElementById('fieldMarca');
    const tipo = document.getElementById('fieldTipo');

    select.addEventListener('change', () => {
        const option = select.options[select.selectedIndex];
        if (!option || !option.dataset) return;
        modelo.value = option.dataset.modelo || '';
        placa.value = option.dataset.placa || '';
        marca.value = option.dataset.marca || '';
        tipo.value = option.dataset.tipo || '';
    });
}

function handleAvariaRepeater() {
    const btn = document.getElementById('btnAddAvaria');
    const list = document.getElementById('avariaList');
    if (!btn || !list) return;

    btn.addEventListener('click', () => {
        const template = list.querySelector('.avaria-item');
        if (!template) return;
        const clone = template.cloneNode(true);
        clone.querySelectorAll('input').forEach(input => {
            input.value = '';
        });
        list.appendChild(clone);
    });
}

function markActiveNav() {
    const current = window.location.pathname;
    document.querySelectorAll('.app-nav .nav-link').forEach(link => {
        if (link.getAttribute('href') === current) {
            link.classList.add('active');
        }
    });
}

function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        const targetId = button.dataset.target;
        const input = document.getElementById(targetId);
        if (!input) return;

        button.addEventListener('click', () => {
            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');
            button.classList.toggle('is-active', !isPassword);
        });
    });
}

function setupChecklistStatus() {
    const selects = document.querySelectorAll('[data-status-select]');
    const avariaSection = document.getElementById('avariaSection');

    if (!selects.length) {
        if (avariaSection) {
            avariaSection.hidden = false;
        }
        return;
    }

    const refreshAvariaSection = () => {
        if (!avariaSection) return;
        const hasNC = Array.from(selects).some(select => select.value === 'NC');
        avariaSection.hidden = !hasNC;
    };

    selects.forEach(select => {
        const row = select.closest('[data-status-row]');
        const observation = row ? row.querySelector('[data-status-obs]') : null;

        const applyState = () => {
            const value = select.value;
            select.classList.remove('status-ok', 'status-alert');
            if (value === 'C') {
                select.classList.add('status-ok');
            } else if (value === 'NC') {
                select.classList.add('status-alert');
            }

            if (observation) {
                const shouldShow = value === 'NC';
                observation.hidden = !shouldShow;
                if (!shouldShow) {
                    observation.querySelectorAll('input, textarea').forEach(field => {
                        field.value = '';
                    });
                }
            }

            refreshAvariaSection();
        };

        select.addEventListener('change', applyState);
        applyState();
    });

    refreshAvariaSection();
}

function setupFuelSlider() {
    document.querySelectorAll('[data-fuel-control]').forEach(control => {
        const slider = control.querySelector('[data-fuel-slider]');
        const hidden = control.querySelector('[data-fuel-value]');
        const labels = Array.from(control.querySelectorAll('[data-fuel-label]'));
        if (!slider || !hidden || !labels.length) return;

        const clampIndex = value => {
            const maxIndex = labels.length - 1;
            if (Number.isNaN(value)) return 0;
            return Math.min(Math.max(value, 0), maxIndex);
        };

        const update = () => {
            const index = clampIndex(parseInt(slider.value, 10));
            const label = labels[index];
            const selected = (label && label.dataset.value) || '';
            hidden.value = selected;
            slider.setAttribute('aria-valuetext', selected);
            labels.forEach((item, idx) => item.classList.toggle('is-active', idx === index));
        };

        slider.addEventListener('input', update);
        slider.addEventListener('change', update);
        update();
    });
}

function setupFormSubmission() {
    const forms = document.querySelectorAll('form.report-form');
    forms.forEach(form => {
        form.addEventListener('submit', (evt) => {
            const veiculo = form.querySelector('select[name="veiculo_id"]');
            const dataSaida = form.querySelector('input[name="data_hora_saida"]');
            const dataChegada = form.querySelector('input[name="data_hora_chegada"]');
            const kmInicial = form.querySelector('input[name="km_inicial"]');
            const kmFinal = form.querySelector('input[name="km_final"]');
            const combustivel = form.querySelector('input[name="combustivel_saida"]') || form.querySelector('input[name="combustivel_chegada"]');
            
            // Se o formulário não possui campos de viagem (partida/chegada),
            // não executa as validações específicas de relatório.
            const hasTripFields = dataSaida || dataChegada || kmInicial || kmFinal || form.querySelector('[data-fuel-control]');
            if (!hasTripFields) {
                return; // permite envio normal (ex: formulário de avarias)
            }

            const isArrival = !!dataChegada;

            // Only validate vehicle for departure forms
            if (!isArrival && veiculo && !veiculo.value) {
                evt.preventDefault();
                alert('Por favor, selecione um veículo.');
                return;
            }

            if (isArrival) {
                if (!dataChegada || !dataChegada.value) {
                    evt.preventDefault();
                    alert('Por favor, informe a data de chegada.');
                    return;
                }
                if (!kmFinal || !kmFinal.value) {
                    evt.preventDefault();
                    alert('Por favor, informe o KM final.');
                    return;
                }
            } else {
                if (!dataSaida || !dataSaida.value) {
                    evt.preventDefault();
                    alert('Por favor, informe a data e horário de saída.');
                    return;
                }
                if (!kmInicial || !kmInicial.value) {
                    evt.preventDefault();
                    alert('Por favor, informe o KM inicial.');
                    return;
                }
            }

            if (!combustivel || !combustivel.value) {
                evt.preventDefault();
                alert('Por favor, defina o nível de combustível.');
                return;
            }
        });
    });
}
