---
id: chuong-16-phan-5
title: 'Chương 16 · Facet tiền tệ'
---

Phần này theo mục 16.4.2, trang 874–884. Category `monetary` gồm `moneypunct` mô tả quy tắc, `money_put` định dạng và `money_get` phân tích giá trị tiền tệ.

## `moneypunct`

`std::moneypunct<CharT, Intl>` có tham số Boolean chọn quy tắc ký hiệu địa phương (`false`) hoặc quốc tế (`true`). Các specialization cho `char` và `wchar_t`, với cả hai giá trị của `Intl`, được bảo đảm trong locale chuẩn.

| Thành viên | Thông tin |
| --- | --- |
| `decimal_point()`, `thousands_sep()`, `grouping()` | Dấu thập phân, dấu nhóm và quy tắc nhóm chữ số. |
| `curr_symbol()` | Chuỗi ký hiệu tiền tệ. |
| `positive_sign()`, `negative_sign()` | Chuỗi thể hiện dấu của giá trị. |
| `frac_digits()` | Số chữ số phần lẻ trong biểu diễn tiền tệ. |
| `pos_format()`, `neg_format()` | Pattern cho giá trị không âm và âm. |

`money_base::pattern` gồm bốn trường từ các giá trị `symbol`, `sign`, `value`, `space`, `none`. `value` là giá trị; `symbol` là vị trí ký hiệu tiền tệ; `sign` là vị trí dấu; `space` yêu cầu khoảng trắng còn `none` là vị trí không bắt buộc khoảng trắng. Pattern có `symbol`, `sign`, `value` và một trong `space`/`none`. Nội dung thực tế của dấu hay ký hiệu vẫn có thể rỗng; `showbase` điều khiển việc yêu cầu ký hiệu.

Dấu nhiều ký tự có quy tắc đặc biệt: ký tự đầu ở vị trí `sign`, các ký tự còn lại đặt sau các thành phần khác, cho phép biểu diễn kiểu ngoặc. Việc chèn và kiểm tra dấu nhóm dùng `grouping()`; khi đọc, dấu nhóm có thể không xuất hiện, nhưng nếu xuất hiện phải đúng quy tắc của facet.

Ví dụ với dấu âm `"()"`, pattern `sign symbol space value` và ký hiệu `$`, một giá trị âm có thể được in thành `($ 1234.56)`: dấu `(` nằm ở vị trí `sign`, còn `)` được đặt sau toàn bộ các trường. Pattern quyết định vị trí; nội dung của các trường đến từ facet và cờ stream. `space` yêu cầu khoảng trắng tại vị trí đó, trong khi `none` không bắt buộc; `internal` có thể dùng vị trí tương ứng để chèn ký tự đệm khi đặt độ rộng.

`grouping()` trả chuỗi mà mỗi byte mô tả kích thước một nhóm chữ số, không phải chuỗi số để hiển thị. Chẳng hạn `"\3"` yêu cầu nhóm ba chữ số. Nếu chuỗi grouping rỗng, không dùng dấu phân nhóm trong đầu vào; nếu được phép, dấu nhóm không bắt buộc nhưng vị trí đã nhập phải hợp lệ. Một locale hệ thống cụ thể có thể chọn quy tắc hoặc ký hiệu khác locale trong sách.

## `money_put` và `money_get`

`money_put<CharT, OutIt>::put(out, intl, ios, fill, value)` ghi biểu diễn theo locale và cờ của `ios`, trả output iterator sau vị trí ghi. Giá trị có thể là `long double` hoặc string chữ số với dấu trừ tùy chọn. `intl` chọn facet địa phương hay quốc tế.

Giá trị truyền vào được hiểu theo **đơn vị nhỏ nhất** được mô tả bởi `frac_digits()`: khi có hai chữ số lẻ, 12345 tương ứng 123,45 đơn vị tiền tệ. Không giả định mọi loại tiền có hai chữ số lẻ. Sách minh họa `long double` được làm tròn và string được xử lý dưới dạng dãy chữ số; không dùng số thực làm phép tính tiền chính xác nếu ứng dụng cần bảo toàn số thập phân tuyệt đối.

`money_get<CharT, InIt>::get(first, last, intl, ios, state, value)` phân tích phạm vi theo locale, cập nhật `state`, trả iterator sau phần đã đọc và có overload kết quả `long double` hoặc string chữ số. Chẳng hạn biểu diễn 123,45 với hai chữ số lẻ cho giá trị đơn vị nhỏ nhất 12345. Khi đọc trực tiếp facet, tự kiểm tra các cờ và phần đầu vào còn lại.

Sách mô tả `money_get` dùng pattern âm để phân tích cả hai dấu, rồi xác định dấu dựa vào chuỗi do facet cung cấp. Việc đọc dừng ở cuối phần tiền tệ được nhận diện, không tự đảm bảo đã tiêu thụ toàn bộ input. Nếu cả dòng phải chỉ chứa giá trị tiền tệ, ứng dụng cần kiểm tra thêm phần còn lại. `showbase` ảnh hưởng đến việc nhận ký hiệu tiền tệ; nếu muốn bắt buộc ký hiệu, đặt cờ này và kiểm tra trạng thái đọc.

## Manipulator C++11

`std::put_money(value, intl)` và `std::get_money(value, intl)` trong `<iomanip>` cho phép dùng những facet này qua stream; `intl` mặc định là `false`. Ví dụ sau tự tạo locale để không cần cài đặt locale hệ thống:

```cpp
#include <cassert>
#include <iomanip>
#include <locale>
#include <sstream>
#include <string>

class TestCurrency : public std::moneypunct<char, false> {
protected:
    char do_decimal_point() const override { return '.'; }
    char do_thousands_sep() const override { return ','; }
    std::string do_grouping() const override { return "\3"; }
    std::string do_curr_symbol() const override { return "$"; }
    std::string do_positive_sign() const override { return ""; }
    std::string do_negative_sign() const override { return "-"; }
    int do_frac_digits() const override { return 2; }
    pattern do_pos_format() const override {
        return pattern{{symbol, sign, none, value}};
    }
    pattern do_neg_format() const override {
        return pattern{{symbol, sign, none, value}};
    }
};

int main() {
    const std::locale loc(std::locale::classic(), new TestCurrency);
    std::ostringstream out;
    out.imbue(loc);
    out << std::showbase << std::put_money(123456.L);
    assert(out.str() == "$1,234.56");
    std::istringstream in(out.str());
    in.imbue(loc);
    in >> std::showbase;
    long double minorUnits = 0;
    assert(in >> std::get_money(minorUnits));
    assert(minorUnits == 123456.L);

    std::ostringstream negative;
    negative.imbue(loc);
    negative << std::showbase << std::put_money(-123456.L);
    assert(negative.str() == "$-1,234.56");

    std::ostringstream digits;
    digits.imbue(loc);
    digits << std::showbase << std::put_money(std::string("123456"));
    assert(digits.str() == "$1,234.56");
}
```

String truyền cho `put_money` ở đây là chuỗi chữ số đơn vị nhỏ nhất, có thể có dấu trừ đầu chuỗi; không đưa dấu thập phân hoặc dấu nhóm của locale vào như thể đó là chuỗi tiền đã định dạng. Locale đặt trên stream phải chứa facet tương ứng với chế độ `intl`. Nếu tên locale được lấy từ hệ thống hoặc người dùng, constructor có thể ném nếu tên không được hỗ trợ. Kết quả của sách dùng locale Đức là ví dụ cụ thể cho máy tác giả, không bảo đảm giống nhau trên mọi hệ thống.
