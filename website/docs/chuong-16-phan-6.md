---
id: chuong-16-phan-6
title: 'Chương 16 · Facet ngày và giờ'
---

Phần này theo mục 16.4.3, trang 884–890 của sách. Hai facet `time_put` và `time_get` thuộc category `time`, định dạng và phân tích ngày giờ qua con trỏ tới đối tượng `std::tm` trong `<ctime>`.

## Các ký hiệu định dạng

| Ký hiệu | Ý nghĩa |
| --- | --- |
| `%a`, `%A` | Tên thứ viết tắt, tên đầy đủ. |
| `%b`, `%B` | Tên tháng viết tắt, tên đầy đủ. |
| `%c`, `%x`, `%X` | Biểu diễn ngày giờ, ngày, giờ theo locale. |
| `%d`, `%m`, `%Y`, `%y` | Ngày trong tháng, tháng, năm đầy đủ, năm hai chữ số. |
| `%H`, `%I`, `%M`, `%S`, `%p` | Giờ 24, giờ 12, phút, giây, ký hiệu AM/PM. |
| `%j`, `%w`, `%U`, `%W` | Ngày trong năm, thứ từ Chủ nhật là 0, số tuần bắt đầu Chủ nhật hoặc thứ Hai. |
| `%Z`, `%%` | Tên múi giờ nếu có, dấu `%` literal. |

Kết quả các ký hiệu phụ thuộc locale và dữ liệu `tm`; không giả định chuỗi tên ngày hoặc tháng luôn bằng tiếng Anh. `%y` có thể gây mơ hồ về thế kỷ; nếu cần định dạng trao đổi rõ ràng, nên thiết kế quy tắc năm cụ thể.

## `time_put` và `time_get`

`time_put<CharT, OutIt>::put` ghi qua output iterator, nhận `ios_base`, ký tự đệm, con trỏ `tm` hợp lệ và một conversion specifier hoặc phạm vi chuỗi định dạng. Nó trả iterator sau phần được ghi. `time_get<CharT, InIt>` đọc qua input iterator; các hàm `get_time`, `get_date`, `get_weekday`, `get_monthname`, `get_year` phục vụ từng dạng. Từ C++11, `get` còn nhận một specifier hoặc toàn bộ chuỗi định dạng. Kiểm tra `iostate` được cập nhật, và giữ đối tượng `tm` hợp lệ trong suốt thao tác.

`time_get::date_order()` cho một trong các giá trị `no_order`, `dmy`, `mdy`, `ymd`, `ydm`. Sách lưu ý cách xử lý năm hai chữ số và việc nhận tên đầy đủ/viết tắt có thể có giới hạn; đừng coi phân tích locale là xác thực đầy đủ mọi giá trị nhập của người dùng.

Khi đọc tên tháng hoặc thứ, facet có thể nhận tên đầy đủ lẫn viết tắt. Nếu sau tên viết tắt có ký tự có thể tiếp tục thành tên đầy đủ, nó có thể thử đọc tiếp và thất bại dù tiền tố đã khớp tên viết tắt. Với năm hai chữ số, sách lưu ý rằng khả năng chấp nhận và thế kỷ được suy ra không nên được giả định cố định. `no_order` cũng không có nghĩa là `mdy`: nó cho biết facet không xác định một thứ tự ngày/tháng/năm cụ thể.

Có thể gọi facet trực tiếp như trong sách. Ví dụ này dùng locale C để không phụ thuộc locale bổ sung được cài trên máy:

```cpp
#include <cassert>
#include <ctime>
#include <iterator>
#include <locale>
#include <sstream>
#include <string>

int main() {
    const std::locale loc = std::locale::classic();
    std::tm value{};
    value.tm_year = 124; // 2024
    value.tm_mon = 2;    // tháng 3
    value.tm_mday = 12;

    std::ostringstream out;
    out.imbue(loc);
    const auto& writer = std::use_facet<std::time_put<char>>(loc);
    const std::string format = "%Y-%m-%d";
    writer.put(std::ostreambuf_iterator<char>(out), out, ' ', &value,
               format.data(), format.data() + format.size());
    assert(out.str() == "2024-03-12");

    std::istringstream in(out.str());
    in.imbue(loc);
    std::tm parsed{};
    std::ios_base::iostate error = std::ios_base::goodbit;
    const auto& reader = std::use_facet<std::time_get<char>>(loc);
    reader.get(std::istreambuf_iterator<char>(in),
               std::istreambuf_iterator<char>(), in, error, &parsed,
               format.data(), format.data() + format.size());
    assert(!(error & std::ios_base::failbit));
    assert(parsed.tm_year == 124 && parsed.tm_mon == 2 && parsed.tm_mday == 12);
}
```

Khi gọi facet trực tiếp, xem các bit lỗi thay vì coi mọi trạng thái khác `goodbit` đều là lỗi: `eofbit` có thể được đặt khi việc đọc hợp lệ vừa chạm cuối input. Một locale đặt tên như `de_DE` có thể không được cài hoặc có tên khác giữa các hệ điều hành; constructor locale có thể ném ngoại lệ, nên ứng dụng cần xử lý trường hợp đó.

## Manipulator C++11

`std::get_time` và `std::put_time` trong `<iomanip>` đưa thao tác vào giao diện stream. Khởi tạo `tm` trước khi đọc và kiểm tra stream:

```cpp
#include <cassert>
#include <ctime>
#include <iomanip>
#include <locale>
#include <sstream>

int main() {
    std::tm date{};
    std::istringstream in("2024-03-12 17:30");
    in.imbue(std::locale::classic());
    assert(in >> std::get_time(&date, "%Y-%m-%d %H:%M"));
    assert(date.tm_year == 124 && date.tm_mon == 2 && date.tm_mday == 12);
    std::ostringstream out;
    out.imbue(std::locale::classic());
    out << std::put_time(&date, "%Y-%m-%d %H:%M");
    assert(out.str() == "2024-03-12 17:30");
}
```

Trong `std::tm`, `tm_year` tính từ 1900 và `tm_mon` chạy từ 0 đến 11. Phân tích thành công không nên được xem là kiểm tra toàn diện tính hợp lệ của một ngày lịch hoặc múi giờ; ứng dụng cần xác thực thêm theo yêu cầu. Khi lấy giờ hiện tại bằng `std::localtime`, kiểm tra kết quả null và cân nhắc tính an toàn đồng thời của môi trường sử dụng.
