import siteConfig from '../data/siteConfig.js';

const { generalResources, tracks } = siteConfig.event;
const tracksWithResources = tracks.filter((track) => track.resources?.length);

function ResourceCard({ title, resources }) {
  return (
    <div className="team-card">
      <p className="team-card__title">{title}</p>
      <ul className="tracks-page__list resources-page__list">
        {resources.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer">{r.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Event-wide links, then datasets and workshop recordings grouped by track. The links live on each
// track in siteConfig.js so they stay next to the rest of that track's copy.
export default function ResourcesPage() {
  return (
    <section>
      <div className="portal-shell__intro">
        <p className="eyebrow">RESOURCES</p>
        <h1 className="section__heading">Datasets and workshop recordings.</h1>
        <p className="section__lede">
          Event slides, plus everything sponsors have shared for their tracks. Track details and
          prizes are on the Tracks tab.
        </p>
      </div>

      {generalResources?.length > 0 && <ResourceCard title="General" resources={generalResources} />}

      {tracksWithResources.map((track) => (
        <ResourceCard key={track.slug} title={track.name} resources={track.resources} />
      ))}
    </section>
  );
}
