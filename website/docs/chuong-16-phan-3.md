---
id: chuong-16-phan-3
title: 'Chương 16 · Sử dụng locale và facet'
---

Phần này theo mục 16.2.1–16.4 mở đầu, trang 860–869.

## Tạo và cài locale

| Biểu thức | Ý nghĩa |
| --- | --- |
| `std::locale::classic()` hoặc `std::locale("C")` | Locale cổ điển được bảo đảm có. |
| `std::locale()` | Bản sao global C++ locale tại lúc tạo. |
| `std::locale("")` | Locale môi trường theo implementation. |
| `std::locale(name)` | Locale theo tên; có thể ném `std::runtime_error` nếu không khả dụng. |
| `stream.imbue(loc)` | Cài locale cho một stream cụ thể. |
| `std::locale::global(loc)` | Đặt global C++ locale và trả locale global trước đó. |

Từ C++11, constructor locale theo tên nhận `std::string`; trước đó có thể dùng `name.c_str()`. Sách minh họa đọc số theo classic locale và ghi theo locale Đức: cùng giá trị có thể dùng dấu chấm khi đọc và dấu phẩy khi ghi, nếu locale đó được cài trên máy.

Đổi global locale **không tự đổi locale đã lưu trong các stream hiện có**; gọi `imbue` trên từng stream nếu muốn đổi. Khi đặt global C++ locale có tên, C locale cũng được thay đổi theo quy tắc thư viện; nói chung không giả định mọi thao tác C và C++ cùng dùng một locale. Thay đổi global state trong chương trình đa luồng cần được thiết kế cẩn thận.

## Facet

Locale là một tập các facet; mỗi facet phụ trách một khía cạnh. Dùng `std::has_facet<F>(loc)` kiểm tra, và `std::use_facet<F>(loc)` lấy tham chiếu chỉ đọc; `use_facet` ném `std::bad_cast` nếu không có facet yêu cầu. Giữ một locale còn sống để bảo đảm tham chiếu facet còn hợp lệ; không giữ tham chiếu lấy từ locale tạm đã bị hủy.

| Category | Các facet tiêu biểu |
| --- | --- |
| numeric | `num_get`, `num_put`, `numpunct` |
| monetary | `money_get`, `money_put`, `moneypunct` |
| time | `time_get`, `time_put` |
| ctype | `ctype`, `codecvt` |
| collate | `collate` |
| messages | `messages` |

### Tùy biến tên Boolean

Ví dụ sách dẫn xuất `numpunct_byname<char>` để giữ các quy tắc còn lại của locale có tên. Ví dụ dưới dùng `numpunct<char>` với classic locale, để chạy được mà không phụ thuộc locale Đức đã cài:

```cpp
#include <cassert>
#include <locale>
#include <sstream>
#include <string>

class BoolNames : public std::numpunct<char> {
protected:
    std::string do_truename() const override { return "wahr"; }
    std::string do_falsename() const override { return "falsch"; }
};

int main() {
    const std::locale loc(std::locale::classic(), new BoolNames);
    assert(std::has_facet<std::numpunct<char>>(loc));
    assert(std::use_facet<std::numpunct<char>>(loc).truename() == "wahr");
    std::ostringstream out;
    out.imbue(loc);
    out << std::boolalpha << true << ' ' << false;
    assert(out.str() == "wahr falsch");
}
```

Constructor locale nhận con trỏ facet và quản lý lifetime theo cơ chế facet; không tự xóa facet sau khi đã chuyển quyền quản lý thành công. Locale được xem là bất biến theo tập facet: để thay một facet, tạo locale mới dựa trên locale cũ.

## Kết hợp locale

| Biểu thức | Ý nghĩa |
| --- | --- |
| `locale(a, b, category)` | Bản sao `a`, thay các facet thuộc category bằng facet từ `b`. |
| `locale(a, name, category)` | Tương tự, lấy category từ locale theo tên. |
| `locale(a, facetPointer)` | Bản sao `a` với facet được cung cấp. |
| `a.combine<F>(b)` | Tạo locale dựa trên `a`, thay facet kiểu `F` bằng facet từ `b`. |
| `loc.name()` | Trả tên nếu có; locale không có tên trả `"*"`. |
| `loc(s1, s2)` | So sánh thứ tự string theo facet `collate`, có thể dùng làm comparator. |

Sao chép locale thường rẻ trong implementation, nhưng không dựa vào một chiến lược reference counting cụ thể như yêu cầu chuẩn. Tên locale là dữ liệu phụ thuộc nền tảng; không dùng chuỗi tên làm cách nhận diện ngôn ngữ tổng quát nếu cần hỗ trợ đa nền tảng đầy đủ.

## Thiết kế facet

Một facet mới dẫn xuất công khai từ `std::locale::facet` và cung cấp `static std::locale::id id` công khai để tra cứu theo kiểu. Standard facet thường có hàm public không virtual gọi hàm protected virtual `do_...`; để thay hành vi, override `do_...`, như `do_truename()` ở ví dụ trên. Các hàm public của facet thường là `const` vì `use_facet` trả tham chiếu const. Các facet `_byname` nhận tên locale để dùng các quy tắc được implementation cung cấp cho tên đó.

Để thấy việc tra cứu facet theo **kiểu**, ví dụ sau tạo một facet riêng, cài nó vào locale rồi đưa cùng facet sang một locale khác bằng `combine`:

```cpp
#include <cassert>
#include <locale>
#include <string>

class Greeting : public std::locale::facet {
public:
    static std::locale::id id;
    explicit Greeting(std::string text) : text_(text) {}
    const std::string& text() const { return text_; }
private:
    std::string text_;
};

std::locale::id Greeting::id;

int main() {
    const std::locale base = std::locale::classic();
    const std::locale vietnamese(base, new Greeting("Xin chao"));
    assert(!std::has_facet<Greeting>(base));
    assert(std::has_facet<Greeting>(vietnamese));

    const std::locale combined = base.combine<Greeting>(vietnamese);
    assert(std::use_facet<Greeting>(combined).text() == "Xin chao");
}
```

Định nghĩa `Greeting::id` ngoài lớp cung cấp đối tượng ID cho kiểu facet; tham số `<Greeting>` trong `combine`, `has_facet` và `use_facet` chỉ rõ kiểu cần tìm. `combine` tạo locale mới, không sửa `base`. Nếu locale nguồn không có facet được yêu cầu, `combine` báo lỗi; `use_facet` cũng ném `std::bad_cast` khi facet không tồn tại. Tham chiếu nhận từ facet phải được dùng khi còn ít nhất một locale giữ facet đó.

:::note Vòng đời facet
Ví dụ tạo `Greeting` với cơ chế quản lý mặc định của `std::locale::facet` (`refs` bằng 0), rồi giao con trỏ cho locale. Với facet tự định nghĩa có cấu hình `refs` khác 0, người tạo cần tuân thủ quy tắc quản lý vòng đời tương ứng; không áp dụng máy móc quy tắc tự hủy của ví dụ này cho mọi facet.
:::
