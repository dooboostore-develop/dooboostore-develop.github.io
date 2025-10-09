import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import template from './dom-parser.route.component.html';
import style from './dom-parser.route.component.css';
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import projectComponent from "@src/component";
import { ComponentBase } from "@dooboostore/simple-boot-front/component/ComponentBase";
import { ValidUtils } from "@dooboostore/core-web/valid/ValidUtils";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import {query} from "@dooboostore/dom-render/components/ComponentBase";

@Sim
@Component({
  template,
  styles: [style],
  using: [projectComponent],
})
export class DomParserRouteComponent extends ComponentBase {
  @query('#example-project')
  exampleProject?: HTMLElement

  async onInitRender(param: any, rawSet: RawSet): Promise<void> {
    await super.onInitRender(param, rawSet);
    // if (ValidUtils.isBrowser() && this.exampleProject) {
    //   const StackBlitzSDK = (this.domRenderConfig?.window as any)?.StackBlitzSDK;
    //   if (StackBlitzSDK) {
    //     StackBlitzSDK.embedProjectId(this.exampleProject, 'stackblitz-starters-2kgyl28t', {
    //       height: '1000px',
    //       view: 'preview',
    //     }).then((vm:any) => {
    //       // Embed 후 추가 제어
    //     }).catch((err:any) => {
    //       console.error('Embed failed:', err);
    //     });
    //   }
    // }
  }
}