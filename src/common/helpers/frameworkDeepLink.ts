function frameworkDeepLink(html: string): string {
  const cmsString = 'https://cms.dev.saveful.com/framework';
  const deepLinkString = 'saveful://make/prep';

  if (html.includes(cmsString)) {
    return html?.replaceAll(cmsString, deepLinkString);
  }

  return html;
}

export default frameworkDeepLink;
