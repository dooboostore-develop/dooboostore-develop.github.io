import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { DomRenderRouteComponent } from "./dom-render.route.component";
import projectComponent, {
  BreadcrumbData,
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "../../../component";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import { ComponentRouterBase } from "@dooboostore/simple-boot-front/component/ComponentRouterBase";
import template from "./dom-render.router.component.html";
import styles from "./dom-render.router.component.css";
import { Router as DomrenderRouter } from "@dooboostore/dom-render/routers/Router";
import {
  Lifecycle,
  Sim,
} from "@dooboostore/simple-boot/decorators/SimDecorator";
import {
  ChildrenSet,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";

@Sim({
  scope: Lifecycle.Transient,
})
@Router({
  path: "/dom-render",
  route: {
    "": "/",
    "/": DomRenderRouteComponent,
  },
})
@Component({
  template,
  styles: [styles],
  using: [DomRenderRouteComponent, projectComponent],
})
export class DomRenderRouterComponent extends ComponentRouterBase {
  @query("h1")
  h1s?: HTMLElement[];

  @query("h2")
  h2s?: HTMLElement[];

  breadcrumbs?: BreadcrumbData[];

  constructor(private router: DomrenderRouter) {
    super({ sameRouteNoApply: true });
  }
  
  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
    this.refreshDecorators();
    const list: BreadcrumbData[] = [
      // { text: "dooboostore", link: "/" },
      // { text: "📦", link: "/packages" },
    ];
    this.h1s?.forEach((it) => {
      list.push({
        text: it.textContent,
        link: `/packages/${it.textContent?.replace("@dooboostore/", "") ?? it.textContent}`,
      });
    });
    const last: BreadcrumbDropdown = {
      items: this.h2s?.map((it) => ({ text: it.textContent, data: it })) ?? [],
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