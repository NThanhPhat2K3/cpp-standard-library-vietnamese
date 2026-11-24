---
id: chuong-15-phan-3
title: 'Chương 15 · Trạng thái và ngoại lệ stream'
---

Phần này theo mục 15.4, trang 758–765 của sách. Stream lưu các cờ trạng thái để báo kết quả I/O; cờ có thể đã được đặt bởi thao tác trước đó và không tự biến mất chỉ vì ta thử lại.

## Các cờ trạng thái

| Cờ `std::ios` | Ý nghĩa |
| --- | --- |
| `goodbit` | Giá trị 0: không có cờ lỗi hay EOF nào được đặt. |
| `eofbit` | Một thao tác gặp cuối đầu vào. |
| `failbit` | Một thao tác không hoàn thành, ví dụ phân tích số gặp định dạng không phù hợp. |
| `badbit` | Lỗi nghiêm trọng liên quan I/O hoặc tính toàn vẹn của stream. |

Các cờ có thể cùng được đặt. Gặp EOF không luôn đồng nghĩa thao tác hiện tại thất bại: đọc thành công số cuối cùng có thể đặt `eofbit` mà chưa đặt `failbit`; lần đọc tiếp theo thường thất bại và đặt thêm `failbit`. Không nên khẳng định `eofbit` chỉ được đặt sau khi thử đọc vượt cuối dữ liệu, vì điều này phụ thuộc thao tác.

Trạng thái thuộc stream, không thuộc riêng stream buffer. Nhiều stream có thể liên kết cùng buffer nhưng có các trạng thái riêng. Tên `hardfail` từng có ở một số implementation cũ không thuộc chuẩn được sách mô tả.

## Kiểm tra và thay đổi trạng thái

| Hàm | Ý nghĩa |
| --- | --- |
| `good()` | Đúng khi không cờ nào được đặt. |
| `eof()` | Đúng khi có `eofbit`. |
| `fail()` | Đúng khi có `failbit` hoặc `badbit`. |
| `bad()` | Đúng khi có `badbit`. |
| `rdstate()` | Trả tập cờ hiện tại. |
| `clear(state)` | Thay tập trạng thái bằng `state`; mặc định `goodbit`. |
| `setstate(state)` | Thêm các cờ vào trạng thái hiện tại. |

Nếu stream không có buffer (`rdbuf() == nullptr`), `clear` còn đặt `badbit`. Có thể xóa riêng `failbit` và giữ các cờ khác:

```cpp
if (strm.rdstate() & std::ios::failbit)
    strm.clear(strm.rdstate() & ~std::ios::failbit);
```

Đây là đoạn mã minh họa trong ngữ cảnh đã có `strm`. Xóa cờ không loại dữ liệu sai ra khỏi đầu vào; nếu muốn phục hồi sau lỗi định dạng, phải xác định cách xử lý dữ liệu còn lại. `clear()` hoặc `setstate()` cũng có thể ném ngoại lệ nếu trạng thái kết quả giao với exception mask.

## Kiểm tra trong điều kiện

Từ C++11, chuyển stream sang `bool` trong điều kiện tương đương `!fail()`: chỉ có `eofbit` vẫn có thể cho kết quả đúng, dù `good()` là sai. `operator!` tương đương `fail()`. Trước C++11, sách mô tả chuyển đổi qua `void*`.

```cpp
#include <cassert>
#include <sstream>

int main() {
    std::istringstream in("10 x 20");
    int value = 0;
    assert(in >> value);
    assert(value == 10);
    assert(!(in >> value)); // x không phải số nguyên
    assert(in.fail());
    in.clear();             // xóa cờ lỗi
    char invalid;
    in >> invalid;          // loại 'x' theo chính sách của ví dụ
    assert(in >> value);
    assert(value == 20);
}
```

Mẫu `while (in >> value)` xử lý giá trị vừa đọc thành công và dừng khi phép đọc thất bại; tránh vòng `while (!in.eof())` vì EOF có thể chỉ được phát hiện trong lần đọc tiếp theo. `!(in >> value)` cần ngoặc để phủ định kết quả đọc.

### Phân biệt hết input với token sai

Chỉ kiểm tra `eof()` sau một lần đọc số thất bại chưa đủ để kết luận input hợp lệ: một token chưa hoàn tất như `-` ở cuối input cũng có thể khiến cả `eofbit` và `failbit` được đặt. Nếu định dạng là một dãy số nguyên phân cách bởi khoảng trắng, có thể kiểm tra hết input **trước** khi bắt đầu đọc token tiếp theo:

```cpp
#include <cassert>
#include <istream>
#include <sstream>
#include <vector>

enum class ReadResult { complete, invalid, io_error };

ReadResult readIntegers(std::istream& in, std::vector<int>& output) {
    for (;;) {
        in >> std::ws;
        if (in.bad()) return ReadResult::io_error;
        if (in.eof()) return ReadResult::complete;
        if (in.fail()) return ReadResult::invalid;

        int value;
        if (!(in >> value)) {
            return in.bad() ? ReadResult::io_error : ReadResult::invalid;
        }
        output.push_back(value);
    }
}

int main() {
    std::vector<int> values;
    std::istringstream valid("10 20   ");
    assert(readIntegers(valid, values) == ReadResult::complete);
    assert(values.size() == 2 && values[1] == 20);
    std::istringstream invalid("10 -");
    std::vector<int> other;
    assert(readIntegers(invalid, other) == ReadResult::invalid);
}
```

Ví dụ giả định exception mask mặc định và giữ lại các số đã đọc trước lỗi. Nếu cần yêu cầu chặt hơn về dấu phân cách giữa các số hoặc muốn rollback toàn bộ kết quả khi gặp lỗi, cần bổ sung quy tắc tương ứng. Với exception mask bật, các thao tác I/O có thể ném và cần được xử lý theo chính sách của caller.

## Exception mask

Mặc định stream không ném `ios_base::failure` chỉ vì một cờ trạng thái được đặt. `exceptions()` trả mask; `exceptions(mask)` đặt mask và có thể ném ngay nếu trạng thái hiện tại đã giao với mask. Khi một thao tác đặt cờ thuộc mask, stream có thể ném `std::ios_base::failure`; từ C++11 kiểu này dẫn xuất từ `std::system_error` và có `code()`.

```cpp
#include <cassert>
#include <ios>
#include <sstream>

int main() {
    std::istringstream in("bad");
    in.exceptions(std::ios::failbit | std::ios::badbit);
    try {
        int value;
        in >> value;
        assert(false);
    } catch (const std::ios_base::failure&) {
        assert(in.fail());
    }
}
```

Có thể đưa `std::ios::goodbit` vào `exceptions()` để bỏ mask. Bật ngoại lệ cho `failbit` cũng khiến lần đọc không thành công ở cuối đầu vào thường ném; phân biệt EOF với lỗi định dạng bằng trạng thái và ngữ cảnh. Sách minh họa một hàm tính tổng lưu mask cũ, bật ngoại lệ, bắt lỗi ở EOF rồi khôi phục mask. Cần lưu ý khôi phục mask cũng có thể ném nếu cờ hiện tại giao với mask cũ; `eof()` đơn lẻ cũng không loại trừ đồng thời có lỗi khác. Chọn chính sách xử lý rõ ràng thay vì nuốt mọi ngoại lệ chỉ vì có `eofbit`.
