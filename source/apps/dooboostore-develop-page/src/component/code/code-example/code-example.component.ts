import {
  attribute,
  ComponentBase,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import { ClipBoardUtils } from "@dooboostore/core-web/clipboard/ClipBoardUtils";
import template from "./code-example.component.html";
import styles from "./code-example.component.css";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { DomRenderNoProxy } from "@dooboostore/dom-render/decorators/DomRenderNoProxy";
export type CodeExampleAttribute = {
  title: string;
  // code: string;
  codeClass: string;
};
@Component({
  selector: "code-example",
  template,
  styles,
})
export class CodeExampleComponent extends ComponentBase<CodeExampleAttribute> {
  @attribute("title")
  title?: string = "";

  @query("code")
  codeElement?: HTMLElement;

  @attribute("codeClass")
  codeClass?: string = "";

  onInitRender(param: any, rawSet: RawSet) {
    super.onInitRender(param, rawSet);
    // console.log('--aa------', this.codesElement);
    // 해당 컴포넌트의 <code> 엘리먼트만 Prism으로 하이라이트 처리
    const prism = (this.domRenderConfig?.window as any)?.Prism;
    if (prism && this.codeElement) {
      prism.highlightElement(this.codeElement);
    }
  }

  copyCode(e: Element) {
    if (
      this.rawSet?.dataSet.render?.innerHTML &&
      this.domRenderConfig?.window
    ) {
      ClipBoardUtils.writeText(
        this.rawSet.dataSet.render.innerHTML,
        this.domRenderConfig.window,
      );
      e.classList.add("copied");
      setTimeout(() => {
        e.classList.remove("copied");
      }, 1500);
    }
    // console.log('-----', this.rawSet?.point.innerHTML);
  }
}
