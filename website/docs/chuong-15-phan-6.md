---
id: chuong-15-phan-6
title: 'Chương 15 · Độ rộng, cơ số và số thực'
---

Phần này theo mục 15.7.3–15.7.7, trang 781–789 của sách.

## Độ rộng, ký tự đệm và căn lề

`width(n)` hoặc `std::setw(n)` đặt **độ rộng tối thiểu** cho phép định dạng tiếp theo có sử dụng width; nội dung dài hơn không bị cắt. Sau khi các phép chèn/trích xuất liên quan dùng width, width thường được đặt lại về 0. `fill(c)` hoặc `std::setfill(c)` đặt ký tự đệm và giữ giá trị đến khi đổi.

| Căn lề | Ví dụ `-42`, width 6, fill `_` |
| --- | --- |
| `std::left` | `-42___` |
| `std::right` | `___-42` |
| `std::internal` | `-___42` |

`internal` đặt khoảng đệm giữa dấu hoặc tiền tố cơ số và phần giá trị khi phù hợp. Căn lề là cờ thuộc `adjustfield` và tồn tại đến khi đổi. `setw` và `setfill` cần `<iomanip>`.

```cpp
#include <cassert>
#include <iomanip>
#include <sstream>

int main() {
    std::ostringstream out;
    out << std::setfill('_') << std::setw(8) << -3.14 << ' ' << 42;
    assert(out.str() == "___-3.14 42");
    std::ostringstream internal;
    internal << std::internal << std::setfill('_') << std::setw(6) << -42;
    assert(internal.str() == "-___42");
}
```

Với input vào mảng ký tự, sách dùng `std::setw(sizeof buffer)` để giới hạn và chừa chỗ cho null. `sizeof(pointer)` chỉ cho kích thước con trỏ, không cấp phát bộ nhớ hay cho biết dung lượng vùng đích. Dùng `std::string` khi có thể; chi tiết overload mảng phụ thuộc phiên bản chuẩn.

## Dấu, chữ hoa và cơ số

`showpos` yêu cầu dấu cộng cho số dương; `uppercase` dùng chữ hoa trong các biểu diễn số tương ứng. `noshowpos` và `nouppercase` tắt các cờ này.

`dec`, `oct`, `hex` chọn cơ số 10, 8, 16 cho số nguyên; trạng thái này tồn tại cho đến khi đổi. `showbase` thêm tiền tố cơ số khi phù hợp, ví dụ `0x` hoặc `0X` cho hex; `noshowbase` tắt. Dùng `setf(std::ios::hex, std::ios::basefield)` hoặc manipulator `std::hex` để thay cờ trong nhóm thay vì chỉ thêm cờ mới.

Nếu xóa cả nhóm `basefield`, input có thể suy ra cơ số từ tiền tố: `0x` là hex, số bắt đầu bằng `0` là octal, còn lại là decimal. Sách lưu ý không có manipulator cơ số 2 trong giao diện này; `bitset` là một cách biểu diễn nhị phân.

```cpp
#include <cassert>
#include <iomanip>
#include <sstream>

int main() {
    std::ostringstream out;
    out << std::hex << std::showbase << std::uppercase << 127;
    assert(out.str() == "0X7F");
    std::istringstream in("0x10 010 10");
    in.unsetf(std::ios::basefield);
    int a, b, c;
    in >> a >> b >> c;
    assert(a == 16 && b == 8 && c == 10);
}
```

## Định dạng số thực

| Chế độ | Ý nghĩa của precision |
| --- | --- |
| `defaultfloat` | Số chữ số có nghĩa; stream chọn dạng tổng quát. |
| `fixed` | Số chữ số sau dấu thập phân. |
| `scientific` | Số chữ số sau dấu thập phân trong phần trị. |
| `hexfloat` | Biểu diễn hex với số mũ cơ số 2; quy tắc precision khác các dạng trên. |

`precision()` đọc thiết lập, `precision(n)` hoặc `std::setprecision(n)` đặt thiết lập. Mặc định precision là 6; đây là sáu **chữ số có nghĩa** trong `defaultfloat`, không phải luôn sáu chữ số sau dấu thập phân. Kết quả được làm tròn theo cách chuyển đổi của stream. `showpoint` yêu cầu hiển thị dấu thập phân và ảnh hưởng số 0 theo định dạng; `uppercase` ảnh hưởng chữ trong biểu diễn số.

```cpp
#include <cassert>
#include <iomanip>
#include <sstream>

int main() {
    std::ostringstream out;
    out << std::fixed << std::setprecision(2) << 421.0 << ' '
        << std::scientific << 421.0;
    assert(out.str() == "421.00 4.21e+02");
}
```

`hexfloat` và `defaultfloat` có từ C++11; ví dụ `234.5` có thể được biểu diễn `0x1.d5p+7`. Bảng trong sách minh họa số chữ số hex thay đổi theo precision; không nên dựa vào kết luận đó: trong chuẩn C++11, định dạng hexfloat không chịu `precision` như `fixed`/`scientific`, và kết quả phụ thuộc quy tắc chuyển đổi/implementation.

## Các cờ chung

`skipws` mặc định cho phép input có định dạng bỏ khoảng trắng đầu; `noskipws` tắt. `unitbuf` yêu cầu đồng bộ sau các thao tác output; `nounitbuf` tắt. `cerr` và `wcerr` mặc định bật `unitbuf`, còn đa số stream khác không bật. Các thao tác input không định dạng có quy tắc riêng và không tự bỏ khoảng trắng đầu.
