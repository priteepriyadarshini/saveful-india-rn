import RenderHTML, { defaultSystemFonts } from 'react-native-render-html';
import React from 'react';
import frameworkDeepLink from '../../../../common/helpers/frameworkDeepLink';
import tw from '../../../../common/tailwind';
import { IArticleBlockText } from '../../../../models/craft';
import { tagStyles } from '../../../../theme/typography';

const RENDERHTML_SYSTEM_FONTS = [
  ...defaultSystemFonts,
  'Saveful-Regular',
  'Saveful-Bold',
  'Saveful-Italic',
  'Saveful-BoldItalic',
];

const RENDERHTML_TAGS_STYLES = {
  ...tagStyles,
  b: { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  strong: { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  em: { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
  i: { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
};

const RENDERHTML_CLASSES_STYLES = {
  'sf-bold': { fontFamily: 'Saveful-Bold', color: '#1A1A1B' },
  'sf-italic': { fontFamily: 'Saveful-Italic', color: '#1A1A1B' },
  'sf-bolditalic': { fontFamily: 'Saveful-BoldItalic', color: '#1A1A1B' },
};

const RENDERHTML_BASE_STYLE = {
  fontFamily: 'Saveful-Regular',
  color: '#575757',
};

const RENDERHTML_DEFAULT_VIEW_PROPS = {
  style: tw`m-0 shrink p-0`,
};

const RENDERHTML_DEFAULT_TEXT_PROPS = {
  style: tw.style('mb-2 shrink px-5 text-midgray'),
};

const RENDERHTML_CONTENT_WIDTH = 225;

function addFontClassesVisitor(el: any) {
  if (el && el.type === 'tag') {
    const isItalic = el.name === 'em' || el.name === 'i';
    const isBold = el.name === 'strong' || el.name === 'b';
    const hasAncestor = (names: string[]) => {
      let p: any = el.parent;
      while (p) {
        if (p.type === 'tag' && names.includes(p.name)) return true;
        p = p.parent;
      }
      return false;
    };
    const style = el.attribs?.style || '';
    const isBoldStyle = /font-weight:\s*(?:700|bold)/i.test(style);
    const isItalicStyle = /font-style:\s*italic/i.test(style);
    const finalBold = isBold || isBoldStyle || hasAncestor(['strong', 'b']);
    const finalItalic = isItalic || isItalicStyle || hasAncestor(['em', 'i']);

    el.attribs = el.attribs || {};
    const cleanedStyle = style
      .replace(/font-family:[^;]+;?/gi, '')
      .replace(/font-weight:[^;]+;?/gi, '')
      .replace(/font-style:[^;]+;?/gi, '')
      .trim();
    if (cleanedStyle) {
      el.attribs.style = cleanedStyle.endsWith(';') ? cleanedStyle : `${cleanedStyle};`;
    } else if (el.attribs.style) {
      delete el.attribs.style;
    }
    const currentClass = el.attribs.class ? `${el.attribs.class} ` : '';
    if (finalBold && finalItalic) {
      el.attribs.class = `${currentClass}sf-bolditalic`;
    } else if (finalBold) {
      el.attribs.class = `${currentClass}sf-bold`;
    } else if (finalItalic) {
      el.attribs.class = `${currentClass}sf-italic`;
    }
  }
}

const RENDERHTML_DOM_VISITORS = {
  onElement: addFontClassesVisitor,
};


export default function TextBlock({ block }: { block: IArticleBlockText }) {
  const systemFonts = RENDERHTML_SYSTEM_FONTS;


  const source = React.useMemo(() => ({ html: frameworkDeepLink(block.text || '') }), [block.text]);

  return (
    <RenderHTML
      source={source}
      systemFonts={systemFonts}
      contentWidth={RENDERHTML_CONTENT_WIDTH}
      baseStyle={RENDERHTML_BASE_STYLE}
      tagsStyles={RENDERHTML_TAGS_STYLES}
      classesStyles={RENDERHTML_CLASSES_STYLES}
      domVisitors={RENDERHTML_DOM_VISITORS}
      defaultViewProps={RENDERHTML_DEFAULT_VIEW_PROPS}
      defaultTextProps={RENDERHTML_DEFAULT_TEXT_PROPS}
    />
  );
}
