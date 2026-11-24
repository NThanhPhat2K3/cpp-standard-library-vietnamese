---
id: chuong-16-phan-9
title: 'Chương 16 · Sắp xếp chuỗi và thông điệp'
---

Phần này theo mục 16.4.5–16.4.6, trang 904–906 của sách.

## Sắp xếp theo locale: `collate`

`std::collate<CharT>` cung cấp quy tắc so sánh chuỗi theo locale. Thứ tự có thể khác thứ tự code unit hoặc thứ tự từ điển mà `std::string` mặc định dùng; cách xử lý dấu và chữ cái phụ thuộc locale cụ thể.

| Hàm | Công dụng |
| --- | --- |
| `compare(first1, last1, first2, last2)` | Trả số âm, 0 hoặc dương theo thứ tự hai phạm vi. |
| `transform(first, last)` | Tạo khóa để so sánh từ điển theo cùng quy tắc collation. |
| `hash(first, last)` | Trả giá trị băm kiểu `long` theo facet. |

Các phạm vi là con trỏ `const CharT*` nửa mở. Dùng `string.data()` và `data() + size()` cho phạm vi hợp lệ; không giả định `string::iterator` là con trỏ thuần. Có thể dùng khóa `transform` khi một chuỗi được so sánh nhiều lần, nhưng chỉ so sánh các khóa tạo theo cùng quy tắc locale và cân nhắc chi phí tạo/lưu khóa.

```cpp
#include <algorithm>
#include <cassert>
#include <locale>
#include <string>
#include <vector>

int main() {
    const std::locale loc = std::locale::classic();
    const auto& col = std::use_facet<std::collate<char>>(loc);
    const std::string a("apple"), b("banana");
    assert(col.compare(a.data(), a.data() + a.size(),
                       b.data(), b.data() + b.size()) < 0);
    std::vector<std::string> words{b, a};
    std::sort(words.begin(), words.end(), loc);
    assert(words.front() == a);
}
```

`locale::operator()` dùng facet collation để so sánh hai string và có thể làm comparator. Locale chuẩn cung cấp `collate<char>` và `collate<wchar_t>`. Không đồng nhất việc locale coi hai chuỗi bằng nhau để sắp xếp với việc chúng có byte giống nhau hoặc được chuẩn hóa Unicode giống nhau.

Ví dụ trong sách giải thích rằng `transform` có ích khi một chuỗi được đem so sánh nhiều lần: tạo khóa một lần, rồi so sánh các khóa theo thứ tự từ điển thông thường. Đoạn sau kiểm tra sự nhất quán giữa hai cách trên với locale cổ điển:

```cpp
#include <cassert>
#include <locale>
#include <string>

int main() {
    const std::locale loc = std::locale::classic();
    const auto& col = std::use_facet<std::collate<char>>(loc);
    const std::string first("apple"), second("banana");
    const auto key1 = col.transform(first.data(), first.data() + first.size());
    const auto key2 = col.transform(second.data(), second.data() + second.size());
    const int order = col.compare(first.data(), first.data() + first.size(),
                                  second.data(), second.data() + second.size());
    assert((key1 < key2) == (order < 0));
    assert((key1 == key2) == (order == 0));
}
```

Khóa là dữ liệu dùng cho so sánh, không phải cách hiển thị mới của chuỗi. Không dựa vào nội dung byte cụ thể của khóa; tạo lại khóa khi thay đổi quy tắc collation hoặc môi trường mà ứng dụng dựa vào. Locale cổ điển ở đây giúp ví dụ chạy không cần cài thêm locale, nhưng không minh họa quy tắc sắp xếp tiếng Việt hay tiếng Đức.

## Message catalog: `messages`

Facet `std::messages<CharT>` cung cấp giao diện truy xuất thông điệp từ catalog:

| Hàm | Công dụng |
| --- | --- |
| `open(name, loc)` | Mở catalog theo tên, trả catalog ID; giá trị âm báo thất bại. |
| `get(catalog, set, id, fallback)` | Lấy thông điệp; dùng fallback nếu không có thông điệp phù hợp. |
| `close(catalog)` | Giải phóng catalog đã mở. |

Cơ chế lưu trữ, cách tìm catalog và ý nghĩa cụ thể của `set`/`id` phụ thuộc implementation; chuẩn không quy định một định dạng catalog chung. Không giả định catalog là file được đọc lại mỗi lần `get()`. Cần đóng catalog thành công sau khi dùng và giữ locale/facet còn hiệu lực trong thời gian sử dụng. Locale chuẩn có các facet `messages<char>` và `messages<wchar_t>`.

Theo mô tả của sách, đối số locale của `open` còn cung cấp facet `ctype` để chuyển thông điệp sang kiểu ký tự cần dùng. Tham số `set` cho phép tổ chức các nhóm thông điệp, nhưng ứng dụng phải dựa vào tài liệu của implementation để biết cách tạo và đánh số catalog. `fallback` là chuỗi dự phòng do caller cung cấp, nên có thể chọn thông điệp hữu ích ngay cả khi bản dịch cụ thể không được tìm thấy.

Ví dụ dưới kiểm tra facet mà không giả định máy có catalog nào được cài:

```cpp
#include <cassert>
#include <locale>

int main() {
    const std::locale loc = std::locale::classic();
    assert(std::has_facet<std::messages<char>>(loc));
}
```

Sách lưu ý giao diện message catalog để ngỏ nhiều chi tiết triển khai; ứng dụng cần tài liệu và dữ liệu catalog phù hợp với nền tảng được dùng.
