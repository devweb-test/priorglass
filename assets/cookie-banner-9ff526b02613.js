(function () {
    const accepted = localStorage.getItem('qformCookiesAccepted');
    if (accepted === 'true') return;

    const defaults = {
        backgroundColor: '#ffffff',
        buttonColor: '#96bf0d',
        shadowColor: '#aaa',
        fontColor: '#000',
        fontSize: '14px',
        lineHeight: '1.5',
        position: 'bottom',
        acceptButtonText: 'Согласен',
    };

    const config = { ...defaults, ...(window.qformCookieSettings || {}) };

    const slideFrom =
        config.position === 'top'          ? 'translate(0, -20px)'    :
        config.position === 'top-right'    ? 'translate(20px, -20px)' :
        config.position === 'top-left'     ? 'translate(-20px, -20px)':
        config.position === 'bottom-right' ? 'translate(20px, 20px)'  :
        config.position === 'bottom-left'  ? 'translate(-20px, 20px)' :
                                             'translate(0, 20px)';

    const style = document.createElement('style');
    style.textContent = `
        #qformCookieBanner {
            position: fixed;
            z-index: 9999;
            background-color: ${config.backgroundColor};
            color: ${config.fontColor};
            box-shadow: 0 4px 10px ${config.shadowColor};
            padding: 16px 20px;
            border-radius: 8px;
            font-family: inherit;
            font-size: ${config.fontSize};
            line-height: ${config.lineHeight};
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            opacity: 0;
            animation: qformSlideIn 0.5s ease forwards;
            width: calc(100% - 40px);
            max-width: 1000px;
            left: 50%;
            transform: translateX(-50%);
            ${config.position.startsWith('top') ? 'top: 20px;' : 'bottom: 20px;'}
        }
        #qformCookieBanner p {
            margin: 0;
            text-align: center;
        }
        #qformCookieBanner a {
            color: ${config.buttonColor};
            text-decoration: underline;
        }
        #qformCookieBanner a:hover {
            opacity: 0.8;
        }
        #qformAcceptCookies {
            background-color: ${config.buttonColor};
            border: none;
            color: #fff;
            padding: 10px 30px;
            font-size: ${config.fontSize};
            border-radius: 5px;
            cursor: pointer;
            outline: none;
            flex-shrink: 0;
        }
        #qformAcceptCookies:hover {
            opacity: 0.85;
        }
        @keyframes qformSlideIn {
            from { opacity: 0; transform: translateX(-50%) ${slideFrom}; }
            to   { opacity: 1; transform: translateX(-50%) translate(0, 0); }
        }
        @media (max-width: 480px) {
            #qformCookieBanner {
                border-radius: 6px;
                padding: 14px 16px;
            }
            #qformCookieBanner p {
                text-align: left;
            }
        }
    `;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.id = 'qformCookieBanner';
    banner.innerHTML = `
        <p>${config.messageText || 'Мы используем файлы cookie.'}</p>
        <button id="qformAcceptCookies">${config.acceptButtonText}</button>
    `;

    document.body.appendChild(banner);

    document.getElementById('qformAcceptCookies').addEventListener('click', () => {
        localStorage.setItem('qformCookiesAccepted', 'true');
        banner.style.opacity = '0';
        banner.style.transition = 'opacity 0.5s ease';
        setTimeout(() => banner.remove(), 500);
    });
})();