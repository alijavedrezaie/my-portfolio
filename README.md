# Ali Rezaie — Portfolio

A responsive portfolio and freelance services website using the approved AR logo, Cardinal Red, Black, Cream and Inter.

## Open in VS Code

Open `ali-rezaie.code-workspace`. Choose **Terminal → Run Task → Start portfolio**, then visit **http://127.0.0.1:4173**. This task uses the Node runtime already installed on this Mac.

If Node is on your normal PATH, `npm run dev` also works. No dependency installation is required.

## Edit the website

- `index.html` — homepage
- `work.html` — portfolio and case-study dialogs
- `services.html` — freelance services, scope and process
- `about.html` — introduction and approach
- `contact.html` — project inquiry builder
- `styles.css` — shared design system and responsive layouts
- `app.js` — navigation, filtering, case studies and inquiry drafts
- `assets/` — exact source logo, local Inter font, project graphics and guidelines PDF

All project descriptions distinguish personal work and concepts. Replace concept studies with real client projects as your portfolio grows. No fictional clients, testimonials or project results are included.

## Freelance inquiries

The contact form creates an email draft addressed to **alijavedrezaie@gmail.com**. It does not silently send or store inquiries. Visitors can also copy the brief or email directly. A connected form service or server endpoint can be added later if you want submissions delivered without an email application.

## Build for hosting

Run `npm run build` from the project folder (or `node build.mjs`). Upload the generated `dist/` directory to a static host. All fonts and visual assets are local. No analytics, external embeds or third-party trackers are included.

This is a local project; it has not been published.

## Verification

The static build, page structure, 152 local links and asset references, form labels, exact logo preservation, and interaction-controller checks passed. Browser layout verification remains pending because the Codex session could not launch a preview server or a browser. After starting the VS Code task, review the five pages at desktop and mobile widths and confirm the email draft opens in your preferred email app.


## Add work and your resume

The Work page has five sections: `photography`, `videos`, `graphic-design`, `web-projects`, and `ui-ux`. In `work.html`, replace a section’s `collection-empty` panel with a `work-grid work-page-grid` containing your cards. Add image files to `assets/`. For a simple project card without a case-study modal:

```html
<div class="work-grid work-page-grid">
  <article class="project">
    <a class="project-media" href="assets/my-photo.jpg">
      <img src="assets/my-photo.jpg" alt="Describe the photograph" width="1500" height="1000" loading="lazy">
    </a>
    <div class="work-card-body">
      <div class="work-card-meta"><span>Photography</span><span>Personal project</span></div>
      <h3 class="work-card-title">Project title</h3>
      <p class="work-card-description">A short description of the work and your role.</p>
      <a class="work-card-link" href="assets/my-photo.jpg">View photograph <span aria-hidden="true">↗</span></a>
    </div>
  </article>
</div>
```

Use actual image dimensions. Video cards can link to your published video URL; web projects can link to the live website. For detailed case studies, follow the existing `data-project` cards and add their content to `cases` in `app.js`. Update each section’s project count as you add work.

To publish your resume:

1. Copy your PDF to `assets/ali-rezaie-resume.pdf`.
2. In `resume.html`, change `data-resume-file=""` to `data-resume-file="assets/ali-rezaie-resume.pdf"`.
3. Run `npm run build`. The resume page will show **View resume** and **Download PDF** instead of the placeholder.

The Resume page is linked from all page headers and footers. No resume experience or credentials are fabricated.


## Production toolkit

`toolkit.html` and `toolkit.js` provide a browser-local storyboard maker, derived shot list and checklists for all three production stages. No account or backend is required. Plans stay on the visitor’s device; uploads are not sent to a server.

- Add, duplicate, reorder and remove up to 60 frames.
- Attach JPG, PNG or WebP references under 1.5 MB each.
- Export/import JSON plans with embedded images; export shot lists as CSV.
- Print or save the plan as PDF using the browser print dialog.
- Browser storage has limited capacity. If saving fails, the page prompts the visitor to export a copy. Export important work before clearing browser data.
