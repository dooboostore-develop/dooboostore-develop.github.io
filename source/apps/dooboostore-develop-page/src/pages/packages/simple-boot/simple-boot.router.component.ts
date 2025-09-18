import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { SimpleBootRouteComponent } from "./simple-boot.route.component";
import projectComponent, {
  BreadcrumbData,
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "../../../component";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import { ComponentRouterBase } from "@dooboostore/simple-boot-front/component/ComponentRouterBase";
import template from "./simple-boot.router.component.html";
import styles from "./simple-boot.router.component.css";
import { Router as DomrenderRouter } from "@dooboostore/dom-render/routers/Router";
import {
  Lifecycle,
  Sim,
} from "@dooboostore/simple-boot/decorators/SimDecorator";
import {
  ChildrenSet,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";
import { ApiService } from "@dooboostore/simple-boot/fetch/ApiService";
import { RoutingDataSet } from "@dooboostore/simple-boot/route/RouterManager";

@Sim({
  scope: Lifecycle.Transient,
})
@Router({
  path: "/simple-boot",
  route: {
    "": "/",
    "/": SimpleBootRouteComponent,
  },
})
@Component({
  template,
  styles: [styles],
  using: [SimpleBootRouteComponent, projectComponent],
})
export class SimpleBootRouterComponent extends ComponentRouterBase {
  name: string = "SimpleBootRouterComponent";
  @query("h1")
  h1s?: HTMLElement[];

  @query("h2")
  h2s?: HTMLElement[];

  breadcrumbs?: BreadcrumbData[];

  constructor(
    private router: DomrenderRouter,
    private apiService: ApiService,
  ) {
    super({ sameRouteNoApply: true });
  }

  // @query("h1")
  // test(e: Element[]) {
  //   console.log('eeeeeeee', e);
  // }
  // @query("h2")
  // test2(e: Element[]) {
  //   console.log('eeeeee2ee', e);
  // }

  // @OnRoute({isActivateMe: true})
  // async dd() {
  //   console.log('onRoutttttttttt');
  //   const datas = await this.apiService
  //     .get({ target: "https://registry.npmjs.org/@dooboostore/dom-render" });
  //   this.name = (datas as any).name;
  // }

  async canActivate(url: RoutingDataSet, data?: any): Promise<void> {
    super.canActivate(url, data);
  }
  async onRouting(r: RoutingDataSet): Promise<void> {
    await super.onRouting(r);
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
