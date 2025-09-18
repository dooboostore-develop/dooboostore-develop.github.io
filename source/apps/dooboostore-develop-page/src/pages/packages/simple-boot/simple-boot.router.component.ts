import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { SimpleBootRouteComponent } from "./simple-boot.route.component";
import projectComponent  from "../../../component";
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
import { OnRawSetRendered, OnRawSetRenderedOtherData } from "@dooboostore/dom-render/lifecycle/OnRawSetRendered";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import {
  BreadcrumbDropdown,
  BreadcrumbItem,
} from "@src/component/breadcrumb";

class BreadcrumbData {}

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
export class SimpleBootRouterComponent
  extends ComponentRouterBase
  implements OnRawSetRendered
{
  name: string = "SimpleBootRouterComponent";
  @query({ selector: "h1", refreshRawSetRendered: true })
  h1s?: HTMLElement[];

  @query({ selector: "h2", refreshRawSetRendered: true })
  h2s?: HTMLElement[];

  breadcrumbs?: BreadcrumbData[];
  // = [
  //   { text: "dooboostore", link: "/" },
  //   { text: "📦", link: "/packages", items: [
  //       { text: "simple-boot", link: "/packages/simple-boot" },
  //       { text: "simple-boot-front", link: "/packages/simple-boot-front" },
  //       { text: "simple-boot-back", link: "/packages/simple-boot-back" },
  //     ] },
  // ];

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

  // async onRawSetRendered(rawSet: RawSet, otherData: OnRawSetRenderedOtherData): Promise<void> {
  //  await super.onRawSetRendered(rawSet, otherData);
  //   console.log('--s----,', otherData, Date.now());
  //   await super.onRawSetRendered(rawSet, otherData);
  // await new Promise<void>((resolve) => setTimeout(resolve, 5000));
  //   console.log('--s----,', otherData, Date.now());
  // }
  async onRawSetRendered(
    rawSet: RawSet,
    otherData: OnRawSetRenderedOtherData,
  ): Promise<void> {
    await super.onRawSetRendered(rawSet, otherData);
    // }
    // onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    //   super.onCreatedThisChildDebounce(childrenSet);
    //   this.refreshDecorators();
    // if (childrenSet.some(it=>it.instance instanceof BreadcrumbComponent)){
    //   return;
    // }
    //   if (otherData.path) return;

    // return;

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
