import { Router } from "@dooboostore/simple-boot/decorators/route/Router";
import { CoreRouterComponent } from "./core/core.router.component";
import { CoreNodeRouterComponent } from "./core-node/core-node.router.component";
import { CoreWebRouterComponent } from "./core-web/core-web.router.component";
import { DomRenderRouterComponent } from "./dom-render/dom-render.router.component";
import { SimpleBootRouterComponent } from "./simple-boot/simple-boot.router.component";
import { SimpleBootFrontRouterComponent } from "./simple-boot-front/simple-boot-front.router.component";
import { SimpleBootHttpServerRouterComponent } from "./simple-boot-http-server/simple-boot-http-server.router.component";
import { SimpleBootHttpServerSsrRouterComponent } from "./simple-boot-http-server-ssr/simple-boot-http-server-ssr.router.component";
import { SwtRouterComponent } from "./swt/swt.router.component";
import { Sim } from "@dooboostore/simple-boot/decorators/SimDecorator";
import { Component } from "@dooboostore/simple-boot-front/decorators/Component";
import template from "./packages.router.component.html";
import styles from "./packages.router.component.css";
import { ComponentRouterBase } from "@dooboostore/simple-boot-front/component/ComponentRouterBase";
import { PackagesRouteComponent } from "./packages.route.component";
import {
  ChildrenSet,
  query,
} from "@dooboostore/dom-render/components/ComponentBase";
import { RawSet } from "@dooboostore/dom-render/rawsets/RawSet";
import { RoutingDataSet } from "@dooboostore/simple-boot/route/RouterManager";
import { OnCreateRenderDataParams } from "@dooboostore/dom-render/lifecycle/OnCreateRenderData";
import { OnCreatedOutletDebounce } from "@dooboostore/dom-render/components/ComponentRouterBase";
import { MenuConfig } from "../config/MenuConfig";
import { ValidUtils } from "@dooboostore/core-web/valid/ValidUtils";
import isBrowser = ValidUtils.isBrowser;
import { DomRenderNoProxy } from "@dooboostore/dom-render/decorators/DomRenderNoProxy";
@Sim
@Router({
  path: "/@dooboostore",
  route: {
    "": "/",
    "/": PackagesRouteComponent,
  },
  routers: [
    CoreRouterComponent,
    CoreNodeRouterComponent,
    CoreWebRouterComponent,
    DomRenderRouterComponent,
    SimpleBootRouterComponent,
    SimpleBootFrontRouterComponent,
    SimpleBootHttpServerRouterComponent,
    SimpleBootHttpServerSsrRouterComponent,
    SwtRouterComponent,
  ],
})
@Component({
  template,
  styles,
})
export class PackagesRouterComponent
  extends ComponentRouterBase
  implements OnCreatedOutletDebounce
{
  frameworksPackages = this.getPackagesByCategory("framework");
  libraryPackages = this.getPackagesByCategory("library")
  corePackages = this.getPackagesByCategory("core");
  @query(".packages-container")
  container?: HTMLElement;

  private observer?: IntersectionObserver;
  @DomRenderNoProxy
  private routingDataSet?: RoutingDataSet;

  constructor() {
    super({ sameRouteNoApply: true });
  }

  getPackagesByCategory(category: "framework" | "library" | "core") {
    const packages = MenuConfig.menuConfig['@dooboostore'];
    return Object.entries(packages)
      .filter((data): data is [string, { _data: MenuConfig.PackageMenu }] => {
        const key = data[0];
        const value = data[1];
        return (
          key !== "" &&
          "_data" in value &&
          MenuConfig.isPackageMenu(value._data) &&
          value._data.category === category
        );
      })
      .map(([key, value]) => ({
        name: key,
        data: value._data,
      }));
  }

  toggleSidebar() {
    if (!this.container) return;

    const sidebar = this.container.querySelector("#sidebar");
    const mainContent = this.container.querySelector(".main-content");

    if (sidebar && mainContent) {
      // 모바일에서는 기존 로직 (open 클래스 토글)
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle("open");
      }
      // PC에서는 closed 클래스와 expanded 클래스 토글
      else {
        sidebar.classList.toggle("closed");
        mainContent.classList.toggle("expanded");
      }
    }
  }

  toggleCategory(categoryId: string) {
    if (!this.container) return;

    const items = this.container.querySelector(`#${categoryId}-items`);
    const arrow = this.container.querySelector(`#${categoryId}-arrow`);

    if (items) {
      items.classList.toggle("open");
    }
    if (arrow) {
      arrow.classList.toggle("rotated");
    }
  }

  private clearAllActiveMenuItems() {
    if (!this.container) return;

    // Remove all active states
    const allItems = this.container.querySelectorAll(".sidebar-item");
    allItems.forEach((item) => item.classList.remove("active"));
  }

  private updateActiveMenuItem(activeId: string) {
    // console.log('container', this.container);
    if (!this.container) return;

    // Remove all active states first
    this.clearAllActiveMenuItems();

    // Add active state to current item
    const activeItem = this.container.querySelector(
      `[href="/@dooboostore/${activeId}"]`,
    );
    if (activeItem) {
      activeItem.classList.add("active");

      // Also expand the parent category
      const parentSection = activeItem.closest(".sidebar-section");
      if (parentSection) {
        const items = parentSection.querySelector(".sidebar-items");
        const arrow = parentSection.querySelector(".category-arrow");
        if (items && arrow) {
          items.classList.add("open");
          arrow.classList.add("rotated");
        }
      }
    }
  }

  private setupIntersectionObserver() {
    if (!this.container) return;

    // Observe sections with data-section attribute
    const sections = this.container.querySelectorAll("[data-section]");

    if (sections.length === 0) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute("data-section");
            if (sectionId) {
              this.updateActiveMenuItem(sectionId);
            }
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0.1,
      },
    );

    sections.forEach((section) => {
      this.observer!.observe(section);
    });
  }

  async onInitRender(param: any, rawSet: RawSet) {
    await super.onInitRender(param, rawSet);
    // console.log('vvvvvvvvvvv');

    if(!isBrowser()) return;

    const uri = this.routingDataSet?.intent.uri;
    // console.log('uri', uri);
    if (typeof uri === 'string'){
      this.menuMatchingStateChange(uri);
    }

    // Handle clicks for mobile sidebar functionality
    this.domRenderConfig?.window?.document.addEventListener("click", (event) => {
      if (!this.container) return;

      const target = event.target as HTMLElement;
      const sidebar = this.container.querySelector("#sidebar");
      const toggleBtn = this.container.querySelector(".menu-toggle-btn");

      // console.log("--si", sidebar, toggleBtn);

      // Only handle clicks on mobile
      if (window.innerWidth <= 768 && sidebar) {
        const isOutsideClick =
          toggleBtn &&
          !sidebar.contains(target) &&
          !toggleBtn.contains(target) &&
          sidebar.classList.contains("open");

        const isMenuItemClick =
          sidebar.classList.contains("open") &&
          target.tagName === "A" &&
          sidebar.contains(target);

        // Close sidebar when clicking outside or on menu items
        if (isOutsideClick || isMenuItemClick) {
          sidebar.classList.remove("open");
        }
      }
    });

    // Setup intersection observer for active menu detection
    setTimeout(() => {
      this.setupIntersectionObserver();
    }, 100);
  }

  async onRouting(r: RoutingDataSet): Promise<void> {
    await super.onRouting(r);
    // console.log('packages Router onRouting', r);
    this.routingDataSet = r;
    const uri = r.intent.uri;
    if (typeof uri === 'string') {
      this.menuMatchingStateChange(uri);
    }
  }

  menuMatchingStateChange(uri: string) {
    setTimeout(() => {
      if (typeof uri === "string") {
        console.log('uri',uri);
        // Extract package name from URI (e.g., "/packages/core" -> "core")
        const packageMatch = uri.match(/^\/@dooboostore\/([^\/]+)/);
        if (packageMatch) {
          console.log('matching');
          const packageName = packageMatch[1];
          // Update active menu item
          this.updateActiveMenuItem(packageName);
        } else if (uri === "@dooboostore" || uri === "/@dooboostore/") {
          // Clear all active states when on packages root page
          this.clearAllActiveMenuItems();
        }
      }
    }, 1)

  }

  onCreatedThisChild(child: any, data: OnCreateRenderDataParams) {
    super.onCreatedThisChild(child, data);
    // console.log('package.Router onCreatedThisChild', child,data);
  }
  onCreatedThisChildDebounce(childrenSet: ChildrenSet[]) {
    super.onCreatedThisChildDebounce(childrenSet);
  }
  onDrThisUnBind() {
    super.onDrThisUnBind();
    this.onDestroyRender();
  }

  onDestroyRender(data?: any) {
    super.onDestroyRender(data);
    if (this.observer) {
      this.observer.disconnect();
    }
  }
  onCreatedOutletDebounce(a: any) {
    // Prism.highlightAll() 전체 하이라이트 제거
  }
}
