function getExternalResourcesConcatenation(resources: Array<string>) {
  return resources.join('');
}
/* eslint-disable no-cond-assign */
function clearExternalResources() {
  let el: HTMLElement | null = null;
  // eslint-disable-next-line no-cond-assign
  while ((el = document.getElementById('external-css'))) {
    el.remove();
  }

  // eslint-disable-next-line no-cond-assign
  while ((el = document.getElementById('external-js'))) {
    el.remove();
  }
}
/* eslint-enable */

export function createExternalCSSLink(resource: string): HTMLLinkElement {
  const link = document.createElement('link');

  link.id = 'external-css';
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = resource;
  link.media = 'all';

  return link;
}

function addCSS(resource: string) {
  const head = document.getElementsByTagName('head')[0];
  const link = createExternalCSSLink(resource);

  head.appendChild(link);

  return link;
}

export function createExternalJSLink(resource): HTMLScriptElement {
  const script = document.createElement('script');

  script.setAttribute('src', resource);
  script.async = false;
  script.setAttribute('id', 'external-js');

  return script;
}

function addJS(resource: string) {
  const script = createExternalJSLink(resource);

  document.head.appendChild(script);

  return script;
}

// 将外部 js 代码添加到 head 中
export function handleEvaluateScript(code: string) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  try {
    // IE浏览器认为script是特殊元素,不能再访问子节点
    script.appendChild(
      document.createTextNode(`
      try {
        ${code}
      } catch (error) {
        //
      }
    `)
    );
  } catch (e) {
    script.text = code;
  }
  document.head.appendChild(script);
}

export function resourceIsCss(resource: string): boolean {
  // 兼容 url 带 search 的情况
  // 例如：https://example.com/foo.css?v=0
  const pathname = new URL(resource).pathname;
  const match = pathname.match(/\.([^.]*)$/);

  return (match && match[1] === 'css') || resource.includes('fonts.googleapis');
}

function addResource(resource: string) {
  const el = resourceIsCss(resource) ? addCSS(resource) : addJS(resource);

  return new Promise(r => {
    el.onload = r;
    el.onerror = r;
  });
}

function waitForLoaded() {
  return new Promise(resolve => {
    if (document.readyState !== 'complete') {
      window.addEventListener('load', resolve);
    } else {
      resolve(null);
    }
  });
}

let cachedExternalResources = '';

export default async function handleExternalResources(externalResources) {
  const extResString = getExternalResourcesConcatenation(externalResources);
  if (extResString !== cachedExternalResources) {
    clearExternalResources();
    await Promise.all(externalResources.map(addResource));
    cachedExternalResources = extResString;

    return waitForLoaded();
  }

  return Promise.resolve();
}
