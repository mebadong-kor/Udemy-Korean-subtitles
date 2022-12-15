let locationChange = false;

(() => {
  let bodyTarget = document.querySelector("body");
  let href = document.location.href;

  window.addEventListener('click', () => {
    if (document.querySelector('.translate-menu') !== null) {
      document.querySelector('.translate-menu').classList.add('translate-menu-hidden')
    }
  });

  let observer = new MutationObserver(() => {
    if(document.querySelector('.control-bar--control-bar--MweER') !== null && !document.querySelector('[name="translate-btn"]')) {
      let htmlText = '<div class="popper--popper--2r2To">' +
                    '<button name="translate-btn" tabindex="0" type="button" class="udlite-btn udlite-btn-small udlite-btn-ghost udlite-heading-sm ' +
                    'control-bar-dropdown--trigger--iFz7P control-bar-dropdown--trigger-dark--1qTuU control-bar-dropdown--trigger-small--1ZPqx" aria-label="한글 자막">' +
                    '  <img src="' + chrome.runtime.getURL('images/menu_icon.png') + '" />' +
                    '</button>' +
                    '<div class="translate-menu translate-menu-hidden"><ul>' + 
                    '<li id="translate-menu-off"><div class="active">사용안함</div></li>' + 
                    '<li id="translate-menu-ko"><div>한글자막</div></li>' + 
                    '<li id="translate-menu-koen"><div>한영자막</div></li>' +
                    '<li class="separator"></li>' +
                    '<li id="translate-location"><div class="list-control-item">자막위치반전<span class="location-control-box" data-checked="false"></span></div></li>' +
                    '</ul></div></div>';
      document.querySelector('.control-bar--control-bar--MweER').insertAdjacentHTML('beforeend', htmlText);

      document.querySelector('[name="translate-btn"]').addEventListener('click', menuShowOrHide);
      document.querySelector('[name="translate-btn"]').addEventListener('mouseenter', () => {
        document.querySelector('[name="translate-btn"]').parentElement.classList.add('udlite-popper-open')
      });
      document.querySelector('[name="translate-btn"]').addEventListener('mouseleave', () => {
        document.querySelector('[name="translate-btn"]').parentElement.classList.remove('udlite-popper-open')
      });
      document.querySelector('#translate-menu-off').addEventListener('click', (e) => {
        e.stopPropagation();
        clearTranslate();
        document.querySelector('.translate-menu li div.active').classList.remove('active');
        document.querySelector('#translate-menu-off div').classList.add('active');
        setStorageData(0)
      });
      document.querySelector('#translate-menu-ko').addEventListener('click', (e) => {
        e.stopPropagation();
        subtitleTranslate(false);
        document.querySelector('.translate-menu li div.active').classList.remove('active');
        document.querySelector('#translate-menu-ko div').classList.add('active');
        setStorageData(1);
      });
      document.querySelector('#translate-menu-koen').addEventListener('click', (e) => {
        e.stopPropagation();
        subtitleTranslate(true);
        document.querySelector('.translate-menu li div.active').classList.remove('active');
        document.querySelector('#translate-menu-koen div').classList.add('active');
        setStorageData(2);
      });
      document.querySelector('#translate-location').addEventListener('click', (e) => {
        e.stopPropagation();
        changeTranslateLocation();
      });
    }
    
    if (href !== document.location.href) {
      href = document.location.href;
      clearTranslate();

      getStorageData();
    }
  });

  let config = {
    attributes: true,
    childList: true,
    CharacterData: true,
  };

  observer.observe(bodyTarget, config);

  getStorageData();
})();

function subtitleTranslate(isKoen) {
  clearTranslate();

  setSettings(isKoen);

  cr.googleTranslate.translate('en', 'ko');
  let lastText = '';

  function check() {
    try {
      checkAndSetSettings();

      let fromEl = document.querySelectorAll('p[data-purpose="transcript-cue-active"] span');
      fromEl = fromEl[fromEl.length - 1];
      
      if (isKoen) {
        if (document.querySelector('.well--container--2edq4') !== null) {
          document.querySelector('.koreanSubtitle').style.fontSize = document.querySelector('.well--container--2edq4').style.fontSize;
        }
      }

      if (fromEl) {
        let currentText = fromEl.textContent;

        if (lastText !== currentText) {
          if (document.querySelector('.well--container--2edq4') !== null) {
            if (isKoen) {
              if (document.querySelector('.well--text--2H_p0.well--transition-active--35hDP') && document.querySelector('.koreanSubtitle').offsetHeight * 2 < document.querySelector('.well--text--2H_p0.well--transition-active--35hDP').offsetHeight) {
                document.querySelector('.koreanSubtitle').style.marginTop = '';
              } else {
                document.querySelector('.koreanSubtitle').style.marginTop = '-2em';
              }

              document.querySelector('.koreanSubtitle').textContent = currentText;
              setTranslateLocation();
            } else {
              document.querySelector('.well--container--2edq4 span').innerHTML = currentText;
            }
          } else {
            let subtitleBox = document.querySelector('.captions-display--captions-cue-text--ECkJu');
            if (isKoen) {
              document.querySelector('.koreanSubtitle').textContent = null;
              let script_content = currentText + "<br>" + subtitleBox.innerHTML;
              if (locationChange) {
                script_content = subtitleBox.innerHTML + "<br>" + currentText;
              }
              subtitleBox.innerHTML = script_content;
            } else {
              subtitleBox.innerHTML = currentText;
            }
          }
        } lastText = fromEl.textContent;
      }
    } catch (e) {
      clearInterval(window.isTranslate);
      setSettings(isKoen);
      lastText = '';
      window.isTranslate = setInterval(check, 100);
    }
  }

  window.isTranslate = setInterval(check, 100);
}

function clearTranslate() {
  cr.googleTranslate.revert();
  if (document.querySelector('.koreanSubtitle')) {
    document.querySelector('.koreanSubtitle').remove();
  }
  clearInterval(window.isTranslate);
  window.isTranslate = undefined;
}

function menuShowOrHide(e) {
  e.stopPropagation();
  if (document.querySelector('.menu--dropdown--3Vksr.dropup.btn-group.open')) {
    document.querySelector('.menu--dropdown--3Vksr.dropup.btn-group.open').classList.remove('open');
  }
  document.querySelector('.translate-menu').classList.contains('translate-menu-hidden') ? 
  document.querySelector('.translate-menu').classList.remove('translate-menu-hidden') :
  document.querySelector('.translate-menu').classList.add('translate-menu-hidden')
}

function setSettings(isKoen) {
  checkAndSetSettings();

  if (isKoen) {
    if (!document.querySelector('.koreanSubtitle')) {
      let koreanSubtitle = document.createElement('span');
      koreanSubtitle.className = 'koreanSubtitle';
      koreanSubtitle.style.cssText = 'text-align: center; color: rgb(255, 255, 255);';
      document.querySelector('.video-player--container--YDQRW').insertBefore(koreanSubtitle, document.querySelector('.well--container--2edq4'));
    }
  }
}

function checkAndSetSettings() {
  if (document.querySelector('.transcript--transcript-panel--kfMxM') === null) {
    document.querySelector('[data-purpose="transcript-toggle"]').click();
  }

  if (document.querySelector('.captions-display--captions-cue-text--ECkJu') === null) {
    document.querySelectorAll('.menu--captions-menu--beS8H .dropdown-menu-link').forEach((e) => {
      if (e.innerText === 'English') {
          e.click();
      }
    });
  }

  if (!document.querySelector('[name="autoscroll-checkbox"]').checked) {
    document.querySelector('[name="autoscroll-checkbox"]').click();
  }
}

function setStorageData(value) {
  chrome.storage.sync.set({'translate_select_option': value}, () => {});
}

function changeTranslateLocation() {
  let value = !JSON.parse(document.querySelector('.location-control-box').dataset.checked)
  chrome.storage.sync.set({'translate_location_option': value}, () => {});

  document.querySelector('.location-control-box').dataset.checked = value;
  locationChange = value;

  setTranslateLocation();
}

function getStorageData() {
  chrome.storage.sync.get('translate_select_option', (data) => {
    if (!data['translate_select_option']) {
      return;
    } 

    setTimeout(() => {
      document.querySelectorAll('.translate-menu > ul > li')[data['translate_select_option']].click();
    }, 3000);
  });

  chrome.storage.sync.get('translate_location_option', (data) => {
    if (!data['translate_location_option']) {
      return;
    }

    setTimeout(() => {
      document.querySelector('#translate-location').click();
    }, 3500);
  });
}

function setTranslateLocation() {
  if (document.querySelector('.koreanSubtitle').textContent) {
    let korSub = document.querySelector('.koreanSubtitle');
    let engSub = document.querySelector('.well--container--2edq4');

    if (locationChange) {
      engSub.after(korSub);
    } else {
      engSub.before(korSub);
    }
  }
}

/**
 * document.querySelector('ul[aria-labelledby="u165-control-bar-dropdown-trigger--256"] button[aria-checked="true"] > div').textContent
 */