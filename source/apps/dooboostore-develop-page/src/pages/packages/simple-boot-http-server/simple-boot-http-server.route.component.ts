import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./simple-boot-http-server.route.component.html";
import style from "./simple-boot-http-server.route.component.css";
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import { ComponentBase } from "@dooboostore/simple-boot-front/component/ComponentBase";
import projectComponent from "@src/component";
import { ValidUtils } from "@dooboostore/core-web/valid/ValidUtils";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import {query} from "@dooboostore/dom-render/components/ComponentBase";
@Sim({ autoCreate: true })
@Component({ template, styles: [style], using: [projectComponent] })
export class SimpleBootHttpServerRouteComponent extends ComponentBase {
  @query('#example-project')
  exampleProject?: HTMLElement
  async onInitRender(param: any, rawSet: RawSet): Promise<void> {
    await super.onInitRender(param, rawSet);
    if (ValidUtils.isBrowser() && this.exampleProject) {
      const StackBlitzSDK = (this.domRenderConfig?.window as any)?.StackBlitzSDK;
      if (StackBlitzSDK) {
        StackBlitzSDK.embedProjectId(this.exampleProject, 'stackblitz-starters-vmpk8vtl', {
          height: '1000px',  // 전체 높이 사용
          // view: 'editor',  // 에디터 뷰 중심 (preview 숨김에 도움)
          // hideExplorer: true,  // 파일 브라우저 (file explorer) 숨기기
          openFile: 'README.md',  // 특정 파일 강제 열지 않음 (브라우저 닫힌 상태 유지)
          terminalHeight: 30  // 터미널 높이 설정 (퍼센트, 0~100). 30%로 터미널 열기
        }).then((vm:any) => {
          // Embed 후 추가 제어 (옵션: 터미널 강제 열기 또는 높이 조정)
          vm.editor.openTerminal();  // 터미널 패널 열기 (Node.js 기반 프로젝트에서 동작)
          // preview 숨기기 (VM API로 패널 조정)
          vm.editor.setLayout({ preview: false });  // preview 패널 비활성화
        }).catch((err:any) => {
          console.error('Embed failed:', err);  // 에러 핸들링
        });
      }
    }
  }

}
