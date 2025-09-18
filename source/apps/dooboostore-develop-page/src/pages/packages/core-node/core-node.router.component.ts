import { Router } from '@dooboostore/simple-boot/decorators/route/Router';
import { CoreNodeRouteComponent } from './core-node.route.component';
import { Component } from '@dooboostore/simple-boot-front/decorators/Component';
import { ComponentRouterBase } from '@dooboostore/simple-boot-front/component/ComponentRouterBase';
import template from './core-node.router.component.html';
import styles from './core-node.router.component.css';
import {Sim} from "@dooboostore/simple-boot";
import { query, Router as DomrenderRouter } from "@dooboostore/dom-render";
import {
  BreadcrumbData,
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "@src/component";
import { ChildrenSet } from "@dooboostore/dom-render/components/ComponentBase";

@Sim
@Router({
    path: '/core-node',
    route: {
      '': '/',
      '/': CoreNodeRouteComponent,
    },
})
@Component({
    template,
  styles,
    using: [CoreNodeRouteComponent]
})
export class CoreNodeRouterComponent extends ComponentRouterBase {
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