import siteConfig from '../data/siteConfig.js';

export default function Footer() {
  const { event } = siteConfig;

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div>
          <p className="footer__mark">WOLFHACKS</p>
          <p className="footer__tagline footer__tagline--acm">
            <a
              className="footer__acm-logo-wrap"
              href={event.acm.url}
              target="_blank"
              rel="noreferrer"
              aria-label={`${event.acm.name} website`}
            >
              <img
                className="footer__acm-logo"
                src={`${import.meta.env.BASE_URL}images/acm-ncsu-logo.png`}
                alt="ACM NCSU Chapter logo"
              />
            </a>
            Hosted by{' '}
            <a className="acm-mention" href={event.acm.url} target="_blank" rel="noreferrer">
              {event.acm.name}
            </a>
            .
          </p>
        </div>

        <nav className="footer__links" aria-label="Footer">
          <a href="#faq">FAQ</a>
        </nav>

        <div className="footer__contact">
          <a href="mailto:acmchapter-org@ncsu.edu">acmchapter-org@ncsu.edu</a>
        </div>
      </div>

      <div className="container">
        <p className="footer__fine">
          WolfHacks is organized by the {event.acm.name} student chapter and is not officially
          affiliated with or endorsed by NC State University. Wolf howl icon by{' '}
          <a href="https://game-icons.net/1x1/lorc/wolf-howl.html" target="_blank" rel="noreferrer">
            Lorc
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
            CC BY 3.0
          </a>
          ).
        </p>
      </div>
    </footer>
  );
}
