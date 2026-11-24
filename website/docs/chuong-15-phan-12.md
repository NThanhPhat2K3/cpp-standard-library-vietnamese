---
id: chuong-15-phan-12
title: 'Chương 15 · Giao diện và iterator stream buffer'
---

Phần này theo mục 15.13.1–15.13.2, trang 826–831. Stream buffer cung cấp giao diện cấp thấp cho ký tự; truy cập trực tiếp nó không tự thực hiện mọi công việc mà stream bao quanh thường làm, như quản lý state và sentry.

## Giao diện ghi

| Hàm | Tác dụng |
| --- | --- |
| `sputc(c)` | Ghi một ký tự; trả `traits_type::eof()` nếu thất bại. |
| `sputn(ptr, n)` | Ghi tối đa `n` ký tự từ phạm vi hợp lệ, trả số ký tự thực tế đã ghi. Null là dữ liệu thông thường. |

## Giao diện đọc

| Hàm | Tác dụng |
| --- | --- |
| `in_avail()` | Báo số ký tự có sẵn theo stream buffer, hoặc giá trị đặc biệt cho biết không còn nguồn. |
| `sgetc()` | Xem ký tự hiện tại mà không lấy đi. |
| `sbumpc()` | Lấy ký tự hiện tại và tiến vị trí. |
| `snextc()` | Tiến qua ký tự hiện tại rồi xem ký tự kế tiếp. |
| `sgetn(ptr, n)` | Đọc tối đa `n` ký tự vào bộ đệm hợp lệ, trả số đã đọc. |
| `sputbackc(c)` | Thử đưa ký tự trở lại vị trí đọc trước đó. |
| `sungetc()` | Thử lùi một ký tự. |

Các hàm đọc một ký tự dùng `traits_type::int_type` và `traits_type::eof()` để biểu diễn thất bại hoặc hết dữ liệu. Khả năng putback phụ thuộc buffer; không dựa vào số lần lùi tùy ý. `in_avail()` chỉ phản ánh thông tin buffer cung cấp tại thời điểm gọi: 0 không chứng minh không còn dữ liệu trong tương lai, và -1 có thể biểu thị không còn ký tự.

Ví dụ về sự khác biệt giữa xem, tiêu thụ và lùi trong một `stringbuf`:

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    std::stringbuf buf("abc", std::ios::in);
    using traits = std::char_traits<char>;
    assert(buf.sgetc() == traits::to_int_type('a'));  // vẫn ở a
    assert(buf.sbumpc() == traits::to_int_type('a')); // lấy a
    assert(buf.sgetc() == traits::to_int_type('b'));
    assert(buf.snextc() == traits::to_int_type('c')); // bỏ b, xem c
    assert(!traits::eq_int_type(buf.sungetc(), traits::eof()));
    assert(buf.sgetc() == traits::to_int_type('b'));
}
```

`sputbackc(c)` có thể yêu cầu buffer đặt lại ký tự khác tại vị trí trước, còn `sungetc()` chỉ yêu cầu quay lại; cả hai đều có thể thất bại. Không mặc định việc thay ký tự được mọi stream buffer hỗ trợ.

```cpp
#include <cassert>
#include <sstream>
#include <string>

int main() {
    std::stringbuf buf(std::ios::in | std::ios::out);
    const char bytes[] = {'A', '\0', 'B'};
    assert(buf.sputn(bytes, 3) == 3);
    assert(buf.pubseekpos(0, std::ios::in) != std::streampos(std::streamoff(-1)));
    assert(buf.sgetc() == 'A');
    char result[3];
    assert(buf.sgetn(result, 3) == 3);
    assert(result[0] == 'A' && result[1] == '\0' && result[2] == 'B');
}
```

## Locale, vị trí và cấu hình buffer

`pubimbue(loc)` đặt locale và trả locale cũ; `getloc()` đọc locale. `pubseekpos(pos, which)` và `pubseekoff(offset, dir, which)` thử định vị theo vị trí tuyệt đối hoặc tương đối; `which` chọn `in`, `out` hoặc cả hai. Kiểm tra vị trí lỗi bằng `pos_type(off_type(-1))` tương ứng.

`pubsetbuf(ptr, n)` yêu cầu thay đổi chiến lược buffer, nhưng tác dụng cụ thể phụ thuộc lớp buffer. Sách nêu trường hợp file buffer dùng `pubsetbuf(nullptr, 0)` trước I/O để yêu cầu không đệm; không giả định mọi buffer hoặc mọi thời điểm đều hỗ trợ cách này.

## Stream buffer iterator

`std::istreambuf_iterator<CharT>` là input iterator đọc trực tiếp stream buffer; `std::ostreambuf_iterator<CharT>` là output iterator ghi từng ký tự. Chúng nằm trong `<iterator>` và có thể tạo từ stream hoặc con trỏ buffer. Input iterator mặc định là end-of-stream; hai input iterator so sánh bằng nhau nếu cả hai cùng là end hoặc cả hai đều chưa là end, nên không dùng chúng để mô tả các subrange tùy ý như iterator thông thường.

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <sstream>
#include <string>

int main() {
    const std::string data("A\0B\n", 4);
    std::istringstream in(data);
    std::ostringstream out;
    std::istreambuf_iterator<char> first(in), end;
    std::ostreambuf_iterator<char> destination(out);
    destination = std::copy(first, end, destination);
    assert(!destination.failed());
    assert(out.str() == data);
}
```

`ostreambuf_iterator::failed()` cho biết một lần ghi đã thất bại; phép gán sau lỗi không ghi thêm. Các thao tác trực tiếp qua buffer iterator không nhất thiết cập nhật trạng thái stream giống `get()`/`put()`, vì vậy kiểm tra lỗi theo giao diện thực sự dùng. Sách cũng minh họa đếm newline bằng `std::count(istreambuf_iterator<char>(in), {}, '\n')`; số newline không nhất thiết bằng số dòng khi dòng cuối không kết thúc bằng newline.

Ví dụ dưới cho thấy iterator đọc cả khoảng trắng và ký tự null, vì nó duyệt trực tiếp buffer chứ không dùng phép trích xuất có định dạng:

```cpp
#include <algorithm>
#include <cassert>
#include <iterator>
#include <sstream>
#include <string>

int main() {
    const std::string data("a\n\0b\nlast", 9);
    std::istringstream input(data);
    const auto newlines = std::count(std::istreambuf_iterator<char>(input),
                                     std::istreambuf_iterator<char>(), '\n');
    assert(newlines == 2); // dòng cuối không có newline
}
```

Sau `count`, các ký tự đã được tiêu thụ; muốn duyệt lại cần tạo nguồn mới hoặc định vị lại nếu nguồn hỗ trợ. Bản sao input iterator cùng dùng buffer không tạo bản sao độc lập của dữ liệu.
