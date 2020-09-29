// Angular Modules
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {Ng2FittextModule} from "ng2-fittext";
// Our created Modules
import { SharedModule } from '../models/shared.module';
import { SkeletonRoutingModule } from './skeleton-routing.module';
// imported Modules
import {ChartsModule} from 'ng2-charts/ng2-charts';

import {GridsterModule} from 'angular-gridster2';

// Our Components
import {AddDeviceComponent} from './dashboard/sheet-content/widgets/devices/management/add-device/add-device.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {DeleteDeviceComponent} from './dashboard/sheet-content/widgets/devices/management/delete-device/delete-device.component';
import {SliderControlDeviceComponent} from './dashboard/sheet-content/widgets/devices/control/slider/slider-control-device.component';
import {SheetContentComponent} from './dashboard/sheet-content/sheet-content.component';
import {PlatformSettingsComponent} from './platform-settings/platform-settings.component';
import {MainMenuComponent} from './main-menu.component';
import {SidebarContentComponent} from './dashboard/sidebar-content/sidebar-content.component';
import {ProjectSharingComponent} from './project-sharing/project-sharing.component';
import {UserSettingsComponent} from './user-profile/user-settings/user-settings.component';
import {RealtimeValueVisualizationComponent} from './dashboard/sheet-content/widgets/visualization/value-visualization/realtime/realtime-value-visualization.component';
import {BarChartVisualizationComponent} from './dashboard/sheet-content/widgets/visualization/chart-visualization/BarChart/bar-chart-visualization.component';

import {HistoryAnomalyComponent} from './dashboard/sheet-content/widgets/anomaly/history-anomaly/history-anomaly.component';
import {RealtimeAnomalyComponent} from './dashboard/sheet-content/widgets/anomaly/realtime-anomaly/realtime-anomaly.component';
import {UserPrivacySettingsComponent} from './user-profile/user-privacy-settings/user-privacy-settings.component';

// primeng modules
import {AccordionModule} from 'primeng/accordion';
import {CardModule} from 'primeng/card';
import {ButtonModule} from 'primeng/button';
import {TabViewModule} from 'primeng/tabview';
import {ToolbarModule} from 'primeng/toolbar';
import {MenubarModule} from 'primeng/menubar';
import {PanelMenuModule} from 'primeng/panelmenu';
import {DropdownModule} from 'primeng/primeng';
import {SliderModule} from 'primeng/slider';
import {InputSwitchModule} from 'primeng/inputswitch';
import {TooltipModule} from 'primeng/tooltip';
import {OverlayPanelModule} from 'primeng/overlaypanel';
import {PanelModule} from 'primeng/panel';
import {GrowlModule} from 'primeng/growl';
import {DialogModule} from 'primeng/dialog';
import {MenuModule} from 'primeng/menu';
import {SidebarModule} from 'primeng/sidebar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import {ScrollPanelModule} from 'primeng/scrollpanel';
import {TieredMenuModule} from 'primeng/tieredmenu';
import {CalendarModule} from 'primeng/calendar';
import {SelectButtonModule} from 'primeng/selectbutton';
import {RadioButtonModule} from 'primeng/radiobutton';
import {ToggleControlDeviceComponent} from './dashboard/sheet-content/widgets/devices/control/toggle/toggle-control-device.component';
import {StateControlDeviceComponent} from './dashboard/sheet-content/widgets/devices/control/state/state-control-device.component';
import {LineChartVisualizationComponent} from './dashboard/sheet-content/widgets/visualization/chart-visualization/LineChart/line-chart-visualization.component';
import {ChartModule} from "primeng/primeng";
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CheckboxModule} from 'primeng/checkbox';
import {MultiSelectModule} from 'primeng/multiselect';
import {ColorPickerModule} from 'primeng/colorpicker';
import {MessageModule} from 'primeng/message';
import {TabMenuModule} from 'primeng/tabmenu';

// rule components
import {CreateRuleComponent} from './dashboard/rules/creation/rule-creation.component';
import {TriggerComponent} from './dashboard/rules/creation/trigger/trigger.component';
import {ActionComponent} from './dashboard/rules/creation/action/action.component';
import {TriggerCombineComponent} from './dashboard/rules/creation/trigger-combine/trigger-combine.component';
import {SelectItemPipe} from './dashboard/rules/pipes/select-item.pipe';
import {RuleCreationService} from './dashboard/rules/service/rule-creation.service';
import {RuleManagementService} from './dashboard/rules/service/rule-management.service';
import {ActionCombineComponent} from './dashboard/rules/creation/action-combine/action-combine.component';
import {SelectedTriggerPipe} from './dashboard/rules/pipes/selected-trigger.pipe';
import {ManagementComponent} from './dashboard/rules/management/management.component';
import {TableModule} from 'primeng/table';
import {SplitButtonModule} from 'primeng/splitbutton';
import {DataViewModule} from 'primeng/dataview';
import {MessagesModule} from 'primeng/messages';
import {FieldsetModule} from 'primeng/primeng';
import { SharingComponent } from './dashboard/rules/sharing/sharing.component';
import { NotificationComponent } from './dashboard/rules/notification/notification.component';
import { NotifyMessageComponent } from './dashboard/rules/notify-message/notify-message.component';
import { RuleNotificationService } from './dashboard/rules/service/rule-notification.service';
import { PlatformDeviceManagementService } from './dashboard/rules/service/platform-device-management.service';
import { DoughnutChartComponent } from './dashboard/sheet-content/widgets/visualization/chart-visualization/doughnut-chart/doughnut-chart.component';
import { BubbleChartVisualizationComponent } from './dashboard/sheet-content/widgets/visualization/chart-visualization/BubbleChart/bubble-chart-visualization.component';
import { PolarAreaChartVisualizationComponent } from './dashboard/sheet-content/widgets/visualization/chart-visualization/polar-area-chart-visualization/polar-area-chart-visualization.component';


@NgModule({
  imports: [
    ScrollPanelModule,
    SidebarModule,
    TieredMenuModule,
    ConfirmDialogModule,
    MenuModule,
    AccordionModule,
    PanelModule,
    GrowlModule,
    OverlayPanelModule,
    TooltipModule,
    InputSwitchModule,
    SliderModule,
    DropdownModule,
    PanelMenuModule,
    MenubarModule,
    ToolbarModule,
    TabViewModule,
    ButtonModule,
    CardModule,
    CommonModule,
    SkeletonRoutingModule,
    ChartsModule,
    FormsModule,
    GridsterModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule,
    DialogModule,
    CalendarModule,
    SelectButtonModule,
    RadioButtonModule,
    CheckboxModule,
    AutoCompleteModule,
    MultiSelectModule,
    TableModule,
    SplitButtonModule,
    FieldsetModule,
    DataViewModule,
    MessagesModule,
    ColorPickerModule,
    MessageModule,
    TabMenuModule,
    Ng2FittextModule
  ],
  providers: [
    RuleCreationService,
    RuleManagementService,
    RuleNotificationService,
    PlatformDeviceManagementService
  ],
  declarations: [
    MainMenuComponent,
    AddDeviceComponent,
    DashboardComponent,
    SliderControlDeviceComponent,
    ToggleControlDeviceComponent,
    StateControlDeviceComponent,
    DeleteDeviceComponent,
    SidebarContentComponent,
    LineChartVisualizationComponent,
    SheetContentComponent,
    PlatformSettingsComponent,
    ProjectSharingComponent,
    UserSettingsComponent,
    RealtimeValueVisualizationComponent,
    BarChartVisualizationComponent,
    ManagementComponent,
    SelectedTriggerPipe,
    ActionCombineComponent,
    SelectItemPipe,
    TriggerCombineComponent,
    ActionComponent,
    TriggerComponent,
    CreateRuleComponent,
    SharingComponent,
    NotificationComponent,
    NotifyMessageComponent,
    RealtimeAnomalyComponent,
    HistoryAnomalyComponent,
    DoughnutChartComponent,
    UserPrivacySettingsComponent,
    UserSettingsComponent,
    BubbleChartVisualizationComponent,
    PolarAreaChartVisualizationComponent,
  ],
  entryComponents: [
    AddDeviceComponent,
    DeleteDeviceComponent
  ]
})
export class SkeletonModule { }
