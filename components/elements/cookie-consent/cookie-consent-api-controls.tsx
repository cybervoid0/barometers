import { run, reset, hide, acceptCategory, showPreferences } from 'vanilla-cookieconsent'
import { cookieConsentConfig } from '@/services/cookie-consent'

const acceptAndHide = (acceptType: string | string[]) => {
  acceptCategory(acceptType)
  hide()
}

const resetPlugin = () => {
  reset(true)
  run(cookieConsentConfig)
}

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('cc--darkmode')
}

const CookieConsentApiBtns = () => {
  return (
    <>
      <p>Api calls:</p>
      <div className="cc-btns">
        <button type="button" onClick={showPreferences}>
          Show Preferences Modal
        </button>
        <button type="button" onClick={() => acceptAndHide('all')}>
          Accept All
        </button>
        <button type="button" onClick={() => acceptAndHide([])}>
          Accept Necessary
        </button>
        <button type="button" onClick={resetPlugin}>
          Reset plugin
        </button>
        <button type="button" onClick={toggleDarkMode}>
          Toggle DarkMode
        </button>
      </div>
    </>
  )
}

export default CookieConsentApiBtns
