import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];

const STORAGE_KEY = "cerion.locale";

type Dict = Record<string, string>;

const en: Dict = {
  // Common
  "common.notConnected": "Not connected",
  "common.noData": "No data",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.export": "Export",
  "common.search": "Search CERION",
  "common.loading": "Loading…",
  "common.comingSoon": "Feature will be available after system integration.",
  "common.interfacePrototype": "Interface Prototype",
  "common.systemIntegration": "System integration",
  "common.language": "Language",
  "common.english": "English",
  "common.vietnamese": "Vietnamese",
  "common.selectSchool": "Select a school",
  "common.noSchoolSelected": "No school selected",
  "common.selectSchoolHint":
    "Owner accounts must select a school before school operational data is displayed.",
  "common.readOnly": "Read-only access",

  // Navigation
  "nav.dashboard": "Dashboard",
  "nav.environment": "Environment",
  "nav.energy": "Energy",
  "nav.devices": "Devices",
  "nav.alerts": "Alerts",
  "nav.history": "History",
  "nav.reports": "Reports",
  "nav.ai": "AI Insights",
  "nav.management": "Management",
  "nav.settings": "Settings",
  "nav.profile": "Profile",
  "nav.mainNavigation": "Main navigation",
  "nav.desc.dashboard": "Executive overview",
  "nav.desc.environment": "Air & comfort",
  "nav.desc.energy": "Electricity monitoring",
  "nav.desc.devices": "Connected hardware",
  "nav.desc.alerts": "Threshold events",
  "nav.desc.history": "Recorded readings",
  "nav.desc.reports": "Periodic summaries",
  "nav.desc.ai": "CERION assistant",
  "nav.desc.management": "Roles & organisation",
  "nav.desc.settings": "Platform preferences",
  "nav.desc.profile": "Account details",

  // Shell
  "shell.notifications": "Notifications",
  "shell.notificationsEmpty": "No notifications",
  "shell.notificationsEmptyHint": "Your notification center is empty.",
  "shell.notificationsHint": "Alerts appear after devices are connected.",
  "shell.openProfile": "Open profile menu",
  "shell.about": "About CERION",
  "shell.signOut": "Sign out",
  "shell.checkingSession": "Checking your session…",

  // Roles
  "role.owner": "Owner",
  "role.admin": "Admin",
  "role.teacher": "Teacher",
  "role.viewer": "Viewer",
  "role.admin.description": "School Administrator",
  "role.teacher.description": "Teacher",
  "role.viewer.description": "Viewer",
  "role.preview": "Role preview",
  "role.previewHint": "Preview the interface as another role. Real roles come from account claims.",

  // Forbidden
  "forbidden.code": "403",
  "forbidden.title": "Forbidden",
  "forbidden.description": "Your role does not have permission to open this page.",
  "forbidden.back": "Back to dashboard",

  // Management
  "management.title": "Management",
  "management.eyebrow": "Organisation",
  "management.description": "Role-aware administration for schools, people, classrooms and devices.",
  "management.schools": "Schools",
  "management.users": "Users",
  "management.roles": "Roles",
  "management.classrooms": "Classrooms",
  "management.devices": "Devices",
  "management.teachers": "Teachers",
  "management.viewers": "Viewers",
  "management.assignment": "Teacher Assignment",
  "management.myClassrooms": "My Classrooms",
  "management.deviceIssues": "Device Issue Reports",
  "management.acknowledgements": "Alert Acknowledgements",
  "management.notes": "Classroom Notes",
  "management.emptyTitle": "No records",
  "management.emptyDescription": "Records appear after the platform is connected to data.",
  "management.auditTitle": "Administrative activity log",
  "management.auditDescription":
    "User creation, deletion, role changes, school and classroom creation, device deletion and configuration changes are recorded here.",
  "management.auditEmpty": "No administrative actions recorded yet.",
  "management.permissions": "Permissions for this role",

  // Settings
  "settings.title": "Settings",
  "settings.eyebrow": "Configuration",
  "settings.description":
    "Interface preferences for the CERION platform. Operational settings activate after integration.",
  "settings.save": "Save settings",
  "settings.theme": "Theme",
  "settings.themeHint": "Appearance preference is saved on this device",
  "settings.light": "Light",
  "settings.dark": "Dark",
  "settings.system": "System",
  "settings.languageHint": "Switch instantly — your choice is remembered on this device.",
  "settings.notifications": "Notifications",
  "settings.school": "School information",
  "settings.dashboardPrefs": "Dashboard preferences",
  "settings.thresholds": "Alert thresholds",
  "settings.dataDisplay": "Data display",
  "settings.integration": "System integration",
  "settings.about": "About CERION",

  // Page headers
  "page.dashboard.eyebrow": "Overview",
  "page.dashboard.title": "Dashboard",
  "page.environment.eyebrow": "Environment",
  "page.environment.title": "Environmental monitoring",
  "page.energy.eyebrow": "Energy",
  "page.energy.title": "Electricity monitoring",
  "page.devices.eyebrow": "Hardware",
  "page.devices.title": "Devices",
  "page.alerts.eyebrow": "Monitoring",
  "page.alerts.title": "Alerts",
  "page.history.eyebrow": "Records",
  "page.history.title": "Historical data",
  "page.reports.eyebrow": "Reporting",
  "page.reports.title": "Reports",
  "page.ai.eyebrow": "Intelligence",
  "page.ai.title": "CERION AI",
  "page.profile.eyebrow": "Account",
  "page.profile.title": "Profile",

  // Login
  "login.title": "Sign in to CERION",
  "login.subtitle": "Enter your credentials to access the platform.",
  "login.email": "Email",
  "login.password": "Password",
  "login.remember": "Remember me",
  "login.submit": "Sign In",
  "login.back": "Back to home",
  "login.error": "Email or password is incorrect.",
};

const vi: Dict = {
  "common.notConnected": "Chưa kết nối",
  "common.noData": "Không có dữ liệu",
  "common.save": "Lưu",
  "common.cancel": "Hủy",
  "common.export": "Xuất dữ liệu",
  "common.search": "Tìm kiếm CERION",
  "common.loading": "Đang tải…",
  "common.comingSoon": "Tính năng sẽ khả dụng sau khi tích hợp hệ thống.",
  "common.interfacePrototype": "Bản giao diện mẫu",
  "common.systemIntegration": "Tích hợp hệ thống",
  "common.language": "Ngôn ngữ",
  "common.english": "Tiếng Anh",
  "common.vietnamese": "Tiếng Việt",
  "common.selectSchool": "Chọn trường học",
  "common.noSchoolSelected": "Chưa chọn trường",
  "common.selectSchoolHint":
    "Tài khoản Owner phải chọn trường trước khi xem dữ liệu vận hành của trường đó.",
  "common.readOnly": "Quyền chỉ xem",

  "nav.dashboard": "Tổng quan",
  "nav.environment": "Môi trường",
  "nav.energy": "Điện năng",
  "nav.devices": "Thiết bị",
  "nav.alerts": "Cảnh báo",
  "nav.history": "Lịch sử",
  "nav.reports": "Báo cáo",
  "nav.ai": "Phân tích AI",
  "nav.management": "Quản lý",
  "nav.settings": "Cài đặt",
  "nav.profile": "Hồ sơ",
  "nav.mainNavigation": "Điều hướng chính",
  "nav.desc.dashboard": "Tổng quan điều hành",
  "nav.desc.environment": "Không khí & tiện nghi",
  "nav.desc.energy": "Giám sát điện năng",
  "nav.desc.devices": "Phần cứng kết nối",
  "nav.desc.alerts": "Sự kiện vượt ngưỡng",
  "nav.desc.history": "Dữ liệu đã ghi nhận",
  "nav.desc.reports": "Báo cáo định kỳ",
  "nav.desc.ai": "Trợ lý CERION",
  "nav.desc.management": "Vai trò & tổ chức",
  "nav.desc.settings": "Tùy chọn nền tảng",
  "nav.desc.profile": "Thông tin tài khoản",

  "shell.notifications": "Thông báo",
  "shell.notificationsEmpty": "Không có thông báo",
  "shell.notificationsEmptyHint": "Trung tâm thông báo đang trống.",
  "shell.notificationsHint": "Cảnh báo sẽ xuất hiện sau khi kết nối thiết bị.",
  "shell.openProfile": "Mở menu hồ sơ",
  "shell.about": "Giới thiệu CERION",
  "shell.signOut": "Đăng xuất",
  "shell.checkingSession": "Đang kiểm tra phiên đăng nhập…",

  "role.owner": "Chủ sở hữu",
  "role.admin": "Quản trị viên",
  "role.teacher": "Giáo viên",
  "role.viewer": "Người xem",
  "role.admin.description": "Quản trị viên nhà trường",
  "role.teacher.description": "Giáo viên",
  "role.viewer.description": "Người xem",
  "role.preview": "Xem thử vai trò",
  "role.previewHint": "Xem giao diện theo vai trò khác. Vai trò thật lấy từ tài khoản.",

  "forbidden.code": "403",
  "forbidden.title": "Không có quyền truy cập",
  "forbidden.description": "Vai trò của bạn không có quyền mở trang này.",
  "forbidden.back": "Về trang Tổng quan",

  "management.title": "Quản lý",
  "management.eyebrow": "Tổ chức",
  "management.description": "Quản trị theo vai trò cho trường học, người dùng, lớp học và thiết bị.",
  "management.schools": "Trường học",
  "management.users": "Người dùng",
  "management.roles": "Vai trò",
  "management.classrooms": "Lớp học",
  "management.devices": "Thiết bị",
  "management.teachers": "Giáo viên",
  "management.viewers": "Người xem",
  "management.assignment": "Phân công giáo viên",
  "management.myClassrooms": "Lớp học của tôi",
  "management.deviceIssues": "Báo hỏng thiết bị",
  "management.acknowledgements": "Xác nhận cảnh báo",
  "management.notes": "Ghi chú lớp học",
  "management.emptyTitle": "Chưa có dữ liệu",
  "management.emptyDescription": "Dữ liệu sẽ hiển thị sau khi nền tảng được kết nối.",
  "management.auditTitle": "Nhật ký hoạt động quản trị",
  "management.auditDescription":
    "Tạo và xóa người dùng, thay đổi vai trò, tạo trường học, tạo lớp học, xóa thiết bị và thay đổi cấu hình đều được ghi lại tại đây.",
  "management.auditEmpty": "Chưa ghi nhận hoạt động quản trị nào.",
  "management.permissions": "Quyền hạn của vai trò này",

  "settings.title": "Cài đặt",
  "settings.eyebrow": "Cấu hình",
  "settings.description":
    "Tùy chọn giao diện cho nền tảng CERION. Cài đặt vận hành sẽ hoạt động sau khi tích hợp.",
  "settings.save": "Lưu cài đặt",
  "settings.theme": "Giao diện",
  "settings.themeHint": "Tùy chọn hiển thị được lưu trên thiết bị này",
  "settings.light": "Sáng",
  "settings.dark": "Tối",
  "settings.system": "Theo hệ thống",
  "settings.languageHint": "Chuyển đổi tức thì — lựa chọn được ghi nhớ trên thiết bị này.",
  "settings.notifications": "Thông báo",
  "settings.school": "Thông tin trường học",
  "settings.dashboardPrefs": "Tùy chọn bảng điều khiển",
  "settings.thresholds": "Ngưỡng cảnh báo",
  "settings.dataDisplay": "Hiển thị dữ liệu",
  "settings.integration": "Tích hợp hệ thống",
  "settings.about": "Giới thiệu CERION",

  "page.dashboard.eyebrow": "Tổng quan",
  "page.dashboard.title": "Bảng điều khiển",
  "page.environment.eyebrow": "Môi trường",
  "page.environment.title": "Giám sát môi trường",
  "page.energy.eyebrow": "Điện năng",
  "page.energy.title": "Giám sát điện năng",
  "page.devices.eyebrow": "Phần cứng",
  "page.devices.title": "Thiết bị",
  "page.alerts.eyebrow": "Giám sát",
  "page.alerts.title": "Cảnh báo",
  "page.history.eyebrow": "Hồ sơ dữ liệu",
  "page.history.title": "Dữ liệu lịch sử",
  "page.reports.eyebrow": "Báo cáo",
  "page.reports.title": "Báo cáo",
  "page.ai.eyebrow": "Trí tuệ nhân tạo",
  "page.ai.title": "CERION AI",
  "page.profile.eyebrow": "Tài khoản",
  "page.profile.title": "Hồ sơ",

  "login.title": "Đăng nhập CERION",
  "login.subtitle": "Nhập thông tin đăng nhập để truy cập nền tảng.",
  "login.email": "Email",
  "login.password": "Mật khẩu",
  "login.remember": "Ghi nhớ đăng nhập",
  "login.submit": "Đăng nhập",
  "login.back": "Về trang chủ",
  "login.error": "Email hoặc mật khẩu không chính xác.",

  // Quản lý người dùng
  "users.create": "Tạo người dùng",
  "users.createHint": "Tạo tài khoản đăng nhập và hồ sơ CERION tương ứng.",
  "users.edit": "Chỉnh sửa người dùng",
  "users.editHint": "Cập nhật thông tin, vai trò và phân công lớp học.",
  "users.delete": "Xóa người dùng",
  "users.deleteHint": "Hồ sơ và quyền truy cập nền tảng sẽ bị xóa ngay lập tức.",
  "users.resetPassword": "Đặt lại mật khẩu",
  "users.toggleActive": "Bật/tắt tài khoản",
  "users.active": "Đang hoạt động",
  "users.disabled": "Đã vô hiệu hóa",
  "users.status": "Trạng thái",
  "users.actions": "Thao tác",
  "users.count": "Số tài khoản",
  "users.emptyTitle": "Chưa có tài khoản",
  "users.emptyDescription": "Tạo tài khoản đầu tiên để bắt đầu.",
  "users.errorTitle": "Không tải được danh sách",
  "users.errorDescription":
    "Không truy cập được danh bạ người dùng. Hãy kiểm tra Cloud Firestore đã bật và quy tắc bảo mật cho phép truy cập.",
  "users.noPermissionTitle": "Không có quyền",
  "users.noPermission": "Vai trò của bạn không thể quản lý tài khoản.",
  "users.field.fullName": "Họ và tên",
  "users.field.email": "Email",
  "users.field.password": "Mật khẩu",
  "users.field.role": "Vai trò",
  "users.field.school": "Trường học",
  "users.field.classrooms": "Lớp học được phân công (tùy chọn)",
  "users.field.classroomsHint": "Ngăn cách tên lớp bằng dấu phẩy.",
  "users.toast.created": "Đã tạo tài khoản người dùng.",
  "users.toast.updated": "Đã cập nhật người dùng.",
  "users.toast.deleted": "Đã xóa người dùng.",
  "users.toast.disabled": "Đã vô hiệu hóa người dùng.",
  "users.toast.enabled": "Đã kích hoạt người dùng.",
  "users.toast.reset": "Đã gửi email đặt lại mật khẩu.",
  "users.error.name": "Vui lòng nhập họ và tên.",
  "users.error.school": "Vui lòng nhập trường học.",
  "users.error.emailInUse": "Email này đã được sử dụng.",
  "users.error.invalidEmail": "Email không hợp lệ.",
  "users.error.weakPassword": "Mật khẩu phải có ít nhất 6 ký tự.",
  "users.error.permission": "Bạn không có quyền thực hiện thao tác này.",
  "users.error.generic": "Thao tác không thành công. Vui lòng thử lại.",
  "users.accountDisabled": "Tài khoản của bạn đã bị vô hiệu hóa.",

};

const DICTS: Record<Locale, Dict> = { en, vi };

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const I18nContext = createContext<I18nValue>({
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => fallback ?? en[key] ?? key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "vi") setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, fallback?: string) => DICTS[locale][key] ?? en[key] ?? fallback ?? key,
    [locale],
  );

  const value = useMemo<I18nValue>(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
