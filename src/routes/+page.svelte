<script lang="ts">
  import { base } from '$app/paths';
  import Meta from '$lib/components/Meta.svelte';
  import PixelPortrait from '$lib/components/PixelPortrait.svelte';
  import { education } from '$lib/data/education';
  import { lnaddress } from '$lib/data/lnaddress';
  import { profile } from '$lib/data/profile';
  import { host } from '$lib/data/terminal';

  const rule = '─'.repeat(host.length);
  /** Link text: the URL without its protocol, the way a terminal would show it. */
  const bare = (url: string) => url.replace(/^https?:\/\//, '');

  const skills = Object.entries(profile.skills);

  // Reads the live theme, so the strip is the palette you are looking at.
  const swatches = [
    '--red',
    '--green',
    '--yellow',
    '--accent',
    '--purple',
    '--cyan',
    '--muted',
    '--faint'
  ];

  // The portrait is a fixed grid of characters, so its height is exactly
  // proportional to the character size. Measure it once, then solve for the
  // size that stands it flush with the text beside it, rows can be added to
  // the list below and the two columns still line up top and bottom.
  let logo = $state<HTMLElement>();
  let info = $state<HTMLElement>();
  let size = $state(0);
  let cramped = $state(false);

  // Bounds on the character size, and the width the text column is entitled to
  // keep, whatever is left over is the portrait's.
  const MIN_PX = 5;
  const MAX_PX = 14;
  const INFO_MIN_REM = 34;
  /** The most of the window's height the portrait may take. Matching the text
   * is the right shape on a tall screen, but the text is a fixed number of
   * rows, so on a short one the portrait would stand as tall as the whole
   * window and leave the terminal nothing. Past this it stops growing and
   * simply sits shorter than the text, as it already does when the width runs
   * out first. */
  const MAX_VIEWPORT_SHARE = 0.6;
  /** The portrait's own geometry, set by scripts/pixel-portrait.py. */
  const LINE_EM = 1.2;
  const CELL_EM = 0.6;

  $effect(() => {
    const logoEl = logo;
    const infoEl = info;
    const row = infoEl?.parentElement;
    if (!logoEl || !infoEl || !row) return;

    // Portrait height and width for a 1px character, taken from whatever size
    // CSS starts it at; constant thereafter. The basis has to come off the
    // <pre>'s own font-size, a custom property reads back unresolved.
    let perPxHigh = 0;
    let perPxWide = 0;

    // An arrow declared after the guard above, so the element types stay
    // narrowed inside it.
    const fit = () => {
      if (!perPxHigh) {
        // Counted, not measured. The portrait is a fixed grid of half-block
        // characters: one line per <span class="r">, each 1.2em tall, each
        // cell 0.6em wide. Measuring the rendered box instead makes the
        // basis depend on which font drew those blocks, and until Fira
        // Code's symbols subset arrives they come from a fallback whose
        // line box is half again as tall. Taken from that frame and kept,
        // the basis stayed wrong, and the portrait stood half again as tall
        // as the text it is supposed to match.
        const lines = logoEl.querySelectorAll('.r');
        if (!lines.length) return;
        let cols = 0;
        for (const line of lines) cols = Math.max(cols, line.textContent?.length ?? 0);
        perPxHigh = lines.length * LINE_EM;
        perPxWide = cols * CELL_EM;
      }
      // Room is measured off the row rather than the portrait, so it stays
      // true once the portrait is out of the flow.
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const room = (row.clientWidth - gap - INFO_MIN_REM * rem) / perPxWide;
      cramped = room < MIN_PX;
      if (cramped) return;

      const target = infoEl.getBoundingClientRect().height / perPxHigh;
      const ceiling = (window.innerHeight * MAX_VIEWPORT_SHARE) / perPxHigh;
      const next = Math.min(target, room, MAX_PX, ceiling);
      // Ignoring hair-thin corrections keeps a resize from oscillating:
      // the portrait's width feeds back into how the text wraps.
      if (Math.abs(next - size) > 0.05) size = next;
    };

    const observer = new ResizeObserver(fit);
    observer.observe(infoEl);
    // The ceiling moves with the window, and a resize that leaves the text
    // the same height (a shorter window, same width) never reaches the
    // observer, so the portrait would keep a size the window no longer has
    // room for.
    window.addEventListener('resize', fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  });

  // Runs while the head is parsed, before anything paints, and only on this
  // page, which is the only one that boots. Deciding this after hydration
  // showed the page for a moment before the overlay covered it. The timeout
  // is a failsafe: if the layout never comes up, the page still appears.
  const bootProbe = `try{var d=document.documentElement;
if(sessionStorage.getItem('booted')!=='1'&&!matchMedia('(prefers-reduced-motion: reduce)').matches)d.dataset.boot='pending';
sessionStorage.setItem('booted','1');
setTimeout(function(){delete d.dataset.boot},3000)}catch(e){}`;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: profile.site,
    email: `mailto:${profile.contact.email}`,
    sameAs: [profile.contact.github, profile.contact.linkedin],
    alumniOf: education.school,
    description: profile.summary
  });
</script>

<Meta page="/" />

<svelte:head>
  <!-- Both are built here, from constants above, no user input reaches them,
       and an inline <script> in the head cannot be written any other way. The
       escaped slash keeps a literal closing tag out of the source, which would
       otherwise end this component's own script block for an HTML parser. -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
  {@html `<script>${bootProbe}<\/script>`}
  <!-- eslint-disable-next-line svelte/no-at-html-tags, no-useless-escape -->
  {@html `<script type="application/ld+json">${jsonLd}<\/script>`}
</svelte:head>

<!-- No `reveal` here, unlike the other pages: this output belongs to the
     terminal below it, and having it rise in while the terminal slides up to
     meet it is two animations disagreeing about what is moving. -->
<div class="fetch">
  <div class="logo" class:cramped bind:this={logo} style:--px-size={size ? `${size}px` : null}>
    <PixelPortrait />
  </div>

  <div class="info" bind:this={info}>
    <h1>
      <span class="user">{profile.handle}</span><span class="at">@</span><span class="user"
        >dev</span
      >
    </h1>
    <p class="rule" aria-hidden="true">{rule}</p>

    <dl>
      <div class="row">
        <dt>name</dt>
        <dd class="strong">{profile.name}</dd>
      </div>
      <div class="row">
        <dt>os</dt>
        <dd>{education.schoolShort}</dd>
      </div>
      <div class="row">
        <dt>kernel</dt>
        <dd>{education.degree}</dd>
      </div>
      <div class="row">
        <dt>uptime</dt>
        <dd>class of {education.classOf}</dd>
      </div>
      <div class="row">
        <dt>shell</dt>
        <dd>{profile.tagline}</dd>
      </div>
      <div class="row">
        <dt>role</dt>
        <dd>{profile.role}</dd>
      </div>
      <div class="row">
        <dt>status</dt>
        <dd class="status">{profile.status}</dd>
      </div>

      <div class="spacer"></div>

      {#each skills as [group, items] (group)}
        <div class="row">
          <dt>{group}</dt>
          <dd>{items.join(', ')}</dd>
        </div>
      {/each}

      <div class="spacer"></div>

      <div class="row">
        <dt>email</dt>
        <dd><a href="mailto:{profile.contact.email}">{profile.contact.email}</a></dd>
      </div>
      <div class="row">
        <dt>github</dt>
        <dd>
          <a href={profile.contact.github} rel="me noopener">{bare(profile.contact.github)}</a>
        </dd>
      </div>
      <div class="row">
        <dt>linkedin</dt>
        <dd>
          <a href={profile.contact.linkedin} rel="me noopener">{bare(profile.contact.linkedin)}</a>
        </dd>
      </div>
      <div class="row">
        <dt>ln/nostr</dt>
        <dd>
          <a href="lightning:{lnaddress}" title="Lightning address and Nostr name">{lnaddress}</a>
        </dd>
      </div>
      <div class="row">
        <dt>resume</dt>
        <dd><a href="{base}/resume">{bare(profile.site)}/resume</a></dd>
      </div>
    </dl>

    <p class="palette" aria-hidden="true">
      {#each swatches as swatch (swatch)}<span style="color: var({swatch})">███</span>{/each}
    </p>
  </div>
</div>

<style>
  .fetch {
    display: flex;
    align-items: flex-start;
    gap: clamp(24px, 4vw, 56px);
    flex-wrap: wrap;
  }

  /* The portrait is a grid of half-block characters, so the character size is
     the pixel size. The script above replaces this with the size that matches
     the text height; the rem keeps it proportional when it cannot run. */
  .logo {
    /* What the fit lands on is near-constant in rem, 0.428 to 0.479 across
       every width the portrait shows at, so starting here means the
       corrected size is a couple of percent away instead of forty, and the
       first paint does not visibly resize. It is also the size with no JS. */
    --px-size: 0.4375rem;
    flex-shrink: 0;
  }

  /* Too narrow to seat the portrait without squeezing the text into a ragged
     column, the text wins. */
  .logo.cramped {
    display: none;
  }

  /* A laptop is wide but short, and the fetch output is a fixed number of rows,
     so its height barely moves with the window: at 700-800px it took about four
     fifths of the screen and left the terminal a sliver. Tighten the block
     itself rather than scaling the whole page down; the portrait follows, being
     sized against this column. */
  @media (min-width: 720px) and (max-height: 900px) {
    .fetch {
      font-size: 0.875rem;
      line-height: 1.45;
    }
  }

  @media (min-width: 720px) and (max-height: 720px) {
    /* Tighter still. The portrait is not dropped here: it is capped against
       the window instead, so it shrinks rather than disappearing. */
    .fetch {
      font-size: 0.8125rem;
      line-height: 1.4;
    }
  }

  .info {
    min-width: 0;
    flex: 1;
  }

  h1 {
    font-size: 1rem;
    font-weight: 700;
  }
  .user {
    color: var(--green);
  }
  .at {
    color: var(--fg);
  }

  .rule {
    color: var(--muted);
    margin-bottom: 6px;
  }

  .row {
    display: grid;
    grid-template-columns: 6.5rem 1fr;
    gap: 12px;
    padding: 1px 0;
  }

  dt {
    color: var(--accent);
    font-weight: 700;
  }

  dd {
    color: var(--muted);
    overflow-wrap: anywhere;
  }
  .strong {
    color: var(--fg);
  }
  .status {
    color: var(--green);
  }

  .spacer {
    height: 0.9em;
  }

  .palette {
    margin-top: 14px;
    letter-spacing: -0.06em;
  }

  @media (max-width: 719px) {
    /* No room for the portrait beside the info on a phone, and stacking it
       just pushes everything below the fold. */
    .logo {
      display: none;
    }
    .row {
      grid-template-columns: 5.5rem 1fr;
      gap: 8px;
    }
  }
</style>
