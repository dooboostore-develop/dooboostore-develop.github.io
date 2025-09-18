import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { SimpleBootFrontRouteComponent } from "./simple-boot-front.route.component";
import projectComponent  from "../../../component";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import { ComponentRouterBase } from "@dooboostore/simple-boot-front/component/ComponentRouterBase";
import template from "./simple-boot-front.router.component.html";
import styles from "./simple-boot-front.router.component.css";
import { Router as DomrenderRouter } from "@dooboostore/dom-render/routers/Router";
import {
  Lifecycle,
  Sim,
} from "@dooboostore/simple-boot/decorators/SimDecorator";
import {
  ChildrenSet,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";
import { DomRenderNoProxy } from "@dooboostore/dom-render/decorators/DomRenderNoProxy";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { OnRawSetRenderedOtherData } from "@dooboostore/dom-render/lifecycle/OnRawSetRendered";
import {
  BreadcrumbData,
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "@src/component/breadcrumb";

@Sim({
  scope: Lifecycle.Transient,
})
@Router({
  path: "/simple-boot-front",
  route: {
    "": "/",
    "/": SimpleBootFrontRouteComponent,
  },
})
@Component({
  template,
  styles: [styles],
  using: [SimpleBootFrontRouteComponent, projectComponent],
})
export class SimpleBootFrontRouterComponent extends ComponentRouterBase {
  @query({ selector: "h1", refreshRawSetRendered: true })
  h1s?: HTMLElement[];

  @query({ selector: "h2", refreshRawSetRendered: true })
  h2s?: HTMLElement[];

  breadcrumbs?: BreadcrumbData[];

  constructor(private router: DomrenderRouter) {
    super({ sameRouteNoApply: true });
  }
  async onRawSetRendered(
    rawSet: RawSet,
    otherData: OnRawSetRenderedOtherData,
  ): Promise<void> {
    await super.onRawSetRendered(rawSet, otherData);
  // }
  // onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
  //   super.onCreatedThisChildDebounce(childrenSet);
  //   this.refreshDecorators();
    const list: BreadcrumbData[] = [
      // { text: "dooboostore", link: "/" },
      // { text: "📦", link: "/packages" },
    ];
    this.h1s?.forEach((it) => {
      list.push({
        text: it.textContent ?? "",
        link: `/@dooboostore/${it.textContent?.replace("@dooboostore/", "") ?? it.textContent}`,
      });
    });
    const last: BreadcrumbDropdown = {
      items:
        this.h2s?.map((it) => ({ text: it.textContent ?? "", data: it })) ?? [],
    };
    list.push(last);
    this.breadcrumbs = list;
  }

  handleNavigate(item: BreadcrumbItem) {
    if (item.link) {
      this.router.go(item.link);
    } else if (item.data instanceof HTMLElement) {
      item.data.scrollIntoView({ behavior: "smooth", block: "center" });
      // const id = item.data.getAttribute("id");
      // if (id) {
      //   this.domRenderConfig?.window.document
      //     .querySelector(`#${id}`)
      //     ?.scrollIntoView({ behavior: "smooth", block: "center" });
      // }
    }
  }
}