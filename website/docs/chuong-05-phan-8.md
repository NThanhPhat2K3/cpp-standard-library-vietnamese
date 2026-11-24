---
id: chuong-05-phan-8
title: 'Chương 5 · Deleter và unique_ptr chi tiết'
sidebar_label: '05 · Phần 8: Deleter và unique_ptr chi tiết'
---

# 5.2.5–5.2.6 · Deleter và `unique_ptr` chi tiết

> **Phạm vi:** Phần còn lại của mục 5.2.5 và toàn bộ mục 5.2.6.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 106–112 (PDF trang 135–141). Các hộp ghi chú là phần bổ sung.

## `default_delete` và specialization cho mảng

Về mặt ý tưởng, `unique_ptr` có một template chính cho đối tượng đơn và một partial specialization cho mảng:

```cpp
// Mô hình khái niệm, không phải khai báo đầy đủ
namespace std {
    template <typename T, typename D = default_delete<T>>
    class unique_ptr;

    template <typename T, typename D>
    class unique_ptr<T[], D>;
}
```

Với đối tượng đơn, giao diện có `*` và `->`; với mảng, giao diện có `[]`. Deleter mặc định cũng có hai dạng tương ứng:

```cpp
std::default_delete<T>    // gọi delete p
std::default_delete<T[]>  // gọi delete[] p
```

Đối số template mặc định của template chính cũng áp dụng cho specialization. Khai báo thực tế của `unique_ptr` phức tạp hơn mô hình trên vì phải xác định kiểu con trỏ và kiểu trả về theo deleter.

## Deleter cho tài nguyên khác

Khi tài nguyên cần thao tác khác ngoài `delete` hoặc `delete[]`, ta cung cấp deleter riêng. Khác với `shared_ptr`, **kiểu deleter là tham số template thứ hai** của `unique_ptr`. Deleter có thể là function object, con trỏ hàm hoặc kiểu callable phù hợp.

```cpp
struct ClassADeleter {
    void operator()(ClassA* p) const noexcept {
        // ghi log nếu phù hợp, rồi giải phóng
        delete p;
    }
};

std::unique_ptr<ClassA, ClassADeleter> up(new ClassA());
```

Với lambda, có thể dùng con trỏ hàm cho lambda không capture, `std::function`, hoặc chính kiểu closure qua `decltype`:

```cpp
std::unique_ptr<int, void(*)(int*)> a(
    new int[10], [](int* p) { delete[] p; });

std::unique_ptr<int, std::function<void(int*)>> b(
    new int[10], [](int* p) { delete[] p; });

auto del = [](int* p) { delete[] p; };
std::unique_ptr<int, decltype(del)> c(new int[10], del);
```

Các ví dụ này minh họa chính sách hủy tùy chỉnh; nếu chỉ quản lý mảng thông thường thì `unique_ptr<int[]>` đơn giản hơn. Một alias template cũng giúp rút ngắn cách viết:

```cpp
template <typename T>
using UniqueWithFunction = std::unique_ptr<T, void(*)(T*)>;

UniqueWithFunction<int> p(new int[10], [](int* q) { delete[] q; });
```

Deleter không được để ngoại lệ thoát ra khi smart pointer thu dọn. Kiểu deleter có thể ảnh hưởng kích thước, khả năng move và chi phí gọi; không phải mọi lựa chọn đều tương đương về hiệu năng.

### Ví dụ: đóng thư mục POSIX

Sách dùng `opendir`, `readdir` và `closedir` để minh họa một handle không được giải phóng bằng `delete`. Ví dụ sau bổ sung kiểm tra `opendir` thất bại trước khi gọi `readdir`:

```cpp
#include <cerrno>
#include <cstring>
#include <dirent.h>
#include <iostream>
#include <memory>

struct DirCloser {
    void operator()(DIR* dir) const noexcept {
        if (closedir(dir) != 0) {
            std::cerr << "closedir() failed\n";
        }
    }
};

int main() {
    std::unique_ptr<DIR, DirCloser> dir(opendir("."));
    if (!dir) {
        std::cerr << "opendir: " << std::strerror(errno) << '\n';
        return 1;
    }
    while (dirent* entry = readdir(dir.get())) {
        std::cout << "process " << entry->d_name << '\n';
    }
} // DirCloser đóng handle
```

`get()` cung cấp handle không sở hữu cho `readdir`; `dir` vẫn giữ quyền sở hữu. Vì `readdir` thay đổi trạng thái duyệt, việc tránh vô tình sao chép chủ sở hữu là hữu ích. Để phân biệt lỗi `readdir` với hết danh sách trong mã thực tế, cần xét `errno` theo hợp đồng POSIX.

Sách cũng chỉ ra có thể dùng `closedir` làm deleter là con trỏ hàm, nhưng nêu vấn đề tính di động lý thuyết giữa language linkage C và C++ đối với kiểu con trỏ hàm. Tác giả minh họa một typedef với `extern "C"`; dùng function object như trên tránh phụ thuộc vào lựa chọn đó và cho phép xử lý mã trả về. Lời gọi gián tiếp qua con trỏ hàm có thể khó tối ưu hơn. Mục 15.12.3 của sách có thêm ví dụ dùng deleter để khôi phục output buffer.

:::note Phạm vi ví dụ
`<dirent.h>` và các hàm thư mục ở đây là POSIX, không thuộc thư viện C++ chuẩn; cần nền tảng hỗ trợ chúng. `opendir` có thể thất bại, vì vậy phải kiểm tra trước khi sử dụng handle.
:::

## 5.2.6 `unique_ptr` chi tiết

`unique_ptr<T, D>` tập trung vào quyền sở hữu độc quyền với chi phí không gian và thời gian thấp. Nó có các tên kiểu `element_type`, `deleter_type` và `pointer`. `pointer` không nhất thiết là `T*`: nếu deleter cung cấp kiểu con trỏ phù hợp, `unique_ptr` có thể dùng kiểu đó. Specialization `unique_ptr<T[], D>` dùng cho mảng.

`T` có thể là `void` khi dùng deleter và kiểu con trỏ thích hợp; không thể mặc định dùng `default_delete<void>` để xóa đối tượng không biết kiểu. Một `unique_ptr` rỗng có giá trị con trỏ null theo kiểu `pointer` của nó.

### Bảng thao tác

| Thao tác | Tác dụng |
|:---|:---|
| `unique_ptr<...> up` hoặc `up(nullptr)` | Tạo con trỏ rỗng với deleter phù hợp. |
| `unique_ptr<...> up(ptr)` | Nhận quyền sở hữu `ptr` với deleter mặc định hoặc deleter được tạo mặc định. |
| `unique_ptr<...> up(ptr, del)` | Nhận quyền sở hữu và lưu deleter. |
| `unique_ptr<...> up(std::move(up2))` | Chuyển quyền sở hữu từ `up2`; nguồn trở thành rỗng. |
| `up = std::move(up2)` | Giải phóng tài nguyên cũ của `up`, rồi nhận quyền sở hữu mới. |
| `up = nullptr`, `up.reset()` | Giải phóng tài nguyên đang sở hữu và làm rỗng. |
| `up.reset(ptr)` | Thay con trỏ được sở hữu và giải phóng tài nguyên cũ. |
| `up.release()` | Trả con trỏ và từ bỏ quyền sở hữu, không gọi deleter. |
| `up.get()` | Lấy con trỏ được lưu mà không chuyển quyền sở hữu. |
| `*up`, `up->member` | Truy cập đối tượng đơn khi con trỏ hợp lệ. |
| `up[index]` | Truy cập phần tử trong specialization mảng, nếu chỉ số hợp lệ. |
| `if (up)` | Kiểm tra con trỏ không rỗng. |
| `up1.swap(up2)`, `swap(up1,up2)` | Hoán đổi con trỏ và deleter theo điều kiện của kiểu. |
| `up1 == up2`, `!=`, `<`, `<=`, `>`, `>=` | So sánh các con trỏ được lưu theo overload áp dụng. |
| `up.get_deleter()` | Lấy tham chiếu tới deleter. |

*Bảng 5.7 của sách, trang 111.* Destructor gọi deleter nếu có tài nguyên; bảng gốc còn liệt kê chuyển từ `auto_ptr`, kiểu đã bị loại khỏi tiêu chuẩn từ C++17.

### Giá trị và tham chiếu của deleter

Constructor nhận con trỏ và deleter có các overload phù hợp cho deleter theo giá trị hoặc tham chiếu:

```cpp
D d;
std::unique_ptr<int, D> p1(new int, D()); // deleter theo giá trị, move
std::unique_ptr<int, D> p2(new int, d);   // deleter theo giá trị, copy
std::unique_ptr<int, D&> p3(new int, d);  // giữ tham chiếu đến d
// unique_ptr<int, const D&> p4(new int, D()); // lỗi: tham chiếu đến deleter tạm
```

Nếu deleter là tham chiếu, đối tượng deleter phải sống lâu hơn `unique_ptr`. Với đối tượng đơn, một số move constructor và assignment là template cho phép chuyển đổi kiểu khi thỏa các điều kiện. Các phép so sánh hoạt động trên con trỏ được lưu; sách cũng nêu overload với `nullptr`.

Specialization mảng khác bản cho đối tượng đơn: dùng `[]` thay cho `*`/`->`, deleter mặc định gọi `delete[]`, và không cho phép chuyển đổi mảng dẫn xuất–cơ sở không an toàn. Các chuyển đổi đủ điều kiện khác vẫn phụ thuộc phiên bản chuẩn và ràng buộc overload; không nên hiểu là mọi chuyển đổi kiểu mảng đều bị cấm.

:::warning `reset` và deleter
Không gọi `up.reset(up.get())`: `reset` sẽ giải phóng tài nguyên cũ trong khi vẫn lưu lại cùng con trỏ, khiến con trỏ bị treo và có thể bị xóa lần nữa. Với deleter tùy chỉnh, bảo đảm nó xử lý đúng tài nguyên và không ném ngoại lệ.
:::
