---
id: chuong-15-phan-5
title: 'Chương 15 · Manipulator và cờ định dạng'
---

Phần này theo mục 15.6–15.7.2, trang 774–781. Manipulator là công cụ áp dụng qua `<<` hoặc `>>` để thay đổi stream hay thực hiện thao tác; không phải manipulator nào cũng đọc hoặc ghi dữ liệu ngay.

## Tổng quan

| Nhóm | Manipulator và tác dụng |
| --- | --- |
| Hành động | `endl` ghi newline và flush; `ends` ghi null; `flush` đồng bộ buffer; `ws` bỏ khoảng trắng đầu. |
| Khoảng trắng, đồng bộ | `skipws`/`noskipws`; `unitbuf`/`nounitbuf`. |
| Cờ tổng quát | `setiosflags(flags)`, `resetiosflags(mask)`. |
| Độ rộng và căn lề | `setw(n)`, `setfill(c)`, `left`, `right`, `internal`. |
| Boolean | `boolalpha`, `noboolalpha`. |
| Số nguyên | `dec`, `oct`, `hex`, `showbase`/`noshowbase`, `showpos`/`noshowpos`, `uppercase`/`nouppercase`. |
| Số thực | `setprecision(n)`, `fixed`, `scientific`, `hexfloat`, `defaultfloat`, `showpoint`/`noshowpoint`. |
| Locale | `put_time`/`get_time`, `put_money`/`get_money`. |

Các manipulator có tham số chuẩn nằm trong `<iomanip>`. Theo sách, `hexfloat`, `defaultfloat` và các manipulator ngày giờ/tiền tệ xuất hiện từ C++11. Chi tiết các nhóm định dạng và locale được trình bày ở các mục tiếp theo.

## Manipulator hoạt động thế nào?

Các manipulator không tham số như `endl` là hàm nhận stream và trả lại stream. Overload `operator<<` nhận con trỏ hàm phù hợp và gọi hàm đó với stream hiện tại; vì trả lại stream, ta có thể tiếp tục nối `<<`. Về ý tưởng, `std::cout << std::endl` tương đương gọi `std::endl(std::cout)`. Với stream ký tự bất kỳ, `endl` dùng `widen('\n')`, sau đó flush.

Manipulator có tham số như `setw(6)` trả một đối tượng thích hợp để toán tử I/O thực hiện thao tác; kiểu cụ thể là chi tiết implementation. Ta có thể tạo manipulator không tham số bằng hàm và manipulator có tham số bằng kiểu cùng toán tử overload.

### Ví dụ tự tạo

```cpp
#include <cassert>
#include <istream>
#include <limits>
#include <sstream>
#include <string>

template<class CharT, class Traits>
std::basic_istream<CharT, Traits>& ignoreLine(std::basic_istream<CharT, Traits>& in) {
    return in.ignore(std::numeric_limits<std::streamsize>::max(), in.widen('\n'));
}

class ignoreLines {
    int count;
public:
    explicit ignoreLines(int n) : count(n) {}
    template<class CharT, class Traits>
    friend std::basic_istream<CharT, Traits>&
    operator>>(std::basic_istream<CharT, Traits>& in, const ignoreLines& action) {
        for (int i = 0; i < action.count && in; ++i)
            in.ignore(std::numeric_limits<std::streamsize>::max(), in.widen('\n'));
        return in;
    }
};

int main() {
    std::istringstream in("skip one\nskip two\nkeep\n");
    in >> ignoreLine >> ignoreLines(1);
    std::string line;
    std::getline(in, line);
    assert(line == "keep");
}
```

Dấu newline được lấy khỏi input khi `ignore` gặp nó. `widen` chuyển ký tự newline cơ bản sang kiểu ký tự của stream.

## Cờ định dạng

`ios_base::fmtflags` lưu các cờ định dạng, trong đó một số thuộc nhóm như `basefield` hoặc `adjustfield`. Ngoài cờ, stream còn lưu width, precision, fill character và locale.

| Hàm | Tác dụng |
| --- | --- |
| `setf(flags)` | Thêm các cờ, trả tập cờ trước đó. |
| `setf(flags, mask)` | Thay các cờ trong nhóm `mask`, trả tập cờ trước đó. |
| `unsetf(flags)` | Xóa các cờ được chọn. |
| `flags()` / `flags(newFlags)` | Đọc hoặc thay toàn bộ `fmtflags`; dạng ghi trả tập cờ cũ. |
| `copyfmt(other)` | Sao chép thông tin định dạng từ stream khác theo quy tắc của hàm. |

Khi chọn một giá trị trong nhóm, dùng overload có mask để xóa lựa chọn cũ trước. `flags()` chỉ lưu `fmtflags`, không lưu riêng width, precision, fill hay locale; nếu cần khôi phục toàn bộ, xử lý các thuộc tính đó tương ứng.

```cpp
#include <cassert>
#include <iomanip>
#include <sstream>
#include <string>

int main() {
    std::ostringstream out;
    const std::ios::fmtflags old = out.flags();
    out.setf(std::ios::showbase | std::ios::uppercase);
    out.setf(std::ios::hex, std::ios::basefield);
    out << 42;
    out.flags(old);
    out << ' ' << 42;
    assert(out.str() == "0X2A 42");
}
```

`setiosflags` đặt thêm cờ và `resetiosflags` xóa các cờ theo mask; thường các manipulator chuyên biệt như `std::hex` dễ đọc hơn.

## Boolean

Mặc định `bool` được in bằng `0` hoặc `1`; `std::boolalpha` chuyển sang tên theo locale, `std::noboolalpha` quay lại dạng số. Với locale `C`, tên là `true` và `false`. Khi đọc dạng số, giá trị khác 0 hoặc 1 đặt `failbit`; khi đọc dạng chữ, chuỗi phải khớp tên theo locale. Cờ này tồn tại trên stream cho đến khi đổi lại.
