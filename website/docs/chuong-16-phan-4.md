---
id: chuong-16-phan-4
title: 'Chương 16 · Facet định dạng và đọc số'
---

Phần này theo mục 16.4.1, trang 870–874. Các phép I/O số của stream dùng các facet thuộc category `numeric`: `numpunct` mô tả ký hiệu, `num_put` định dạng output và `num_get` phân tích input.

## `numpunct`

| Thành viên | Giá trị |
| --- | --- |
| `decimal_point()` | Ký tự dấu thập phân. |
| `thousands_sep()` | Ký tự phân cách nhóm chữ số. |
| `grouping()` | Chuỗi byte mã hóa kích thước nhóm tính từ phải sang trái. |
| `truename()`, `falsename()` | Tên Boolean dạng chữ. |

Các specialization `numpunct<char>` và `numpunct<wchar_t>` được yêu cầu trong locale chuẩn. `grouping()` không phải chuỗi chữ số hiển thị: `"\3"` chứa một byte có giá trị 3 và thường chỉ nhóm ba chữ số lặp lại; `"3"` chứa mã ký tự `'3'`, không phải số 3. Chuỗi rỗng biểu thị không nhóm; giá trị `CHAR_MAX` có ý nghĩa dừng nhóm thêm. Quy tắc nhóm được áp dụng từ bên phải.

```cpp
#include <cassert>
#include <iomanip>
#include <locale>
#include <sstream>
#include <string>

class GroupedNumbers : public std::numpunct<char> {
protected:
    char do_decimal_point() const override { return ','; }
    char do_thousands_sep() const override { return '.'; }
    std::string do_grouping() const override { return "\3"; }
    std::string do_truename() const override { return "dung"; }
    std::string do_falsename() const override { return "sai"; }
};

int main() {
    const std::locale loc(std::locale::classic(), new GroupedNumbers);
    std::ostringstream out;
    out.imbue(loc);
    out << 1000000 << ' ' << 12.5;
    assert(out.str() == "1.000.000 12,5");
    const auto& punct = std::use_facet<std::numpunct<char>>(loc);
    assert(punct.decimal_point() == ',' && punct.grouping() == "\3");

    std::ostringstream words;
    words.imbue(loc);
    words << std::boolalpha << true << ' ' << false;
    assert(words.str() == "dung sai");

    std::istringstream input("1.234,5 dung");
    input.imbue(loc);
    double number = 0;
    bool flag = false;
    assert(input >> number >> std::boolalpha >> flag);
    assert(number == 1234.5 && flag);
}
```

Ví dụ tạo facet cục bộ, không cần locale hệ thống cụ thể. `std::boolalpha` yêu cầu đọc hoặc ghi Boolean bằng tên do facet cung cấp; không bật cờ này thì biểu diễn Boolean theo số. Cách nhóm khác nhau theo vùng; `"\3\2"` là cách mô tả nhóm đầu 3 chữ số từ phải rồi nhóm 2 chữ số tiếp theo lặp lại. Sách nêu thêm `CHAR_MAX` để chặn việc nhóm tiếp theo.

| `grouping()` | Ví dụ với 1.000.000 và dấu phân cách `,` |
| --- | --- |
| Chuỗi rỗng | `1000000` |
| `"\3"` | `1,000,000` |
| `"\3\2"` | `10,00,000` |
| Một byte `2`, tiếp theo là `CHAR_MAX` | `10000,00` |

Khi tạo chuỗi có `CHAR_MAX`, có thể dùng `std::string` và `push_back` thay vì tưởng ký tự hiển thị là một chữ số. Các nhóm được tính từ phải sang trái; nếu đầu vào có dấu phân nhóm sai vị trí, thao tác đọc số có thể đặt `failbit`. Luôn kiểm tra stream trước khi sử dụng kết quả.

## `num_put`

`std::num_put<CharT, OutputIterator>` cung cấp overload `put(to, ios, fill, value)`: ghi biểu diễn của giá trị vào output iterator, dùng thông tin định dạng và locale của đối tượng `ios`, rồi trả iterator sau khi ghi. Mặc định iterator là `ostreambuf_iterator<CharT>`.

```cpp
#include <cassert>
#include <iterator>
#include <locale>
#include <sstream>

int main() {
    std::ostringstream out;
    out.imbue(std::locale::classic());
    const auto& facet = std::use_facet<std::num_put<char>>(out.getloc());
    std::ostreambuf_iterator<char> pos(out);
    pos = facet.put(pos, out, ' ', 1234.5);
    assert(!pos.failed());
    assert(out.str() == "1234.5");
}
```

Các overload hỗ trợ Boolean, các kiểu nguyên có dấu/không dấu thích hợp, số thực và `const void*`. Locale chuẩn có các facet thông dụng cho `char` và `wchar_t`; nếu dùng iterator hoặc specialization khác, kiểm tra facet phù hợp có trong locale.

## `num_get`

`std::num_get<CharT, InputIterator>::get(first, last, ios, state, value)` phân tích một giá trị từ phạm vi iterator theo định dạng và locale của `ios`, cập nhật `state` và trả iterator tới vị trí sau phần đã dùng. Mặc định input iterator là `istreambuf_iterator<CharT>`. Cần kiểm tra các cờ trong `state`, gồm `failbit` và `eofbit`; đến cuối dữ liệu không nhất thiết có nghĩa phân tích thất bại.

```cpp
#include <cassert>
#include <ios>
#include <iterator>
#include <locale>
#include <sstream>

int main() {
    std::istringstream in("123 rest");
    in.imbue(std::locale::classic());
    std::ios_base::iostate state = std::ios_base::goodbit;
    long value = 0;
    const auto& facet = std::use_facet<std::num_get<char>>(in.getloc());
    std::istreambuf_iterator<char> first(in), last;
    auto next = facet.get(first, last, in, state, value);
    assert(!(state & std::ios_base::failbit));
    assert(value == 123 && next != last && *next == ' ');
}
```

Gọi facet trực tiếp không tương đương toàn bộ thao tác `operator>>`: người gọi chịu trách nhiệm về sentry, khoảng trắng và cách áp dụng trạng thái thích hợp. Sách liệt kê các overload cho những kiểu số và con trỏ; không dựa vào giả định rằng giá trị đích luôn không đổi khi phân tích thất bại, vì các trường hợp chuyển đổi số có quy tắc giá trị và lỗi riêng.
