---
id: chuong-07-phan-5
title: 'Chương 7 · Ngoại lệ và ví dụ vector'
sidebar_label: '07 · Phần 5: Ngoại lệ và vector<bool>'
---

# 7.3.4–7.3.6 · Ngoại lệ và `vector<bool>`

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 278–282 (PDF trang 307–311). Các ghi chú hiện đại được tách riêng.

## 7.3.4 Xử lý ngoại lệ

`vector` chỉ hỗ trợ kiểm tra lỗi logic ở mức hạn chế: `at()` kiểm tra chỉ số và báo lỗi bằng `std::out_of_range`; `operator[]` không có hợp đồng kiểm tra như vậy. Ngoại lệ cũng có thể phát sinh khi cấp phát bộ nhớ hoặc từ các thao tác của kiểu phần tử.

Sách trình bày các bảo đảm sau, với giả thiết destructor không ném ngoại lệ:

- `push_back()` khi gặp ngoại lệ không làm thay đổi container; `insert()`, `emplace()`, `emplace_back()` và `push_back()` cũng thành công hoặc không có tác động nếu các thao tác copy/move của phần tử không ném.
- `pop_back()` không ném; `erase()` không ném nếu các thao tác copy/move của phần tử không ném; `swap()` và `clear()` không ném.
- Sách khái quát rằng với phần tử có thao tác copy/move không ném, các thao tác thành công hoặc không có tác động, và đưa kiểu dữ liệu đơn giản POD làm ví dụ.

:::caution Điều kiện theo chuẩn và phiên bản
Bảo đảm không thay đổi khi thêm phần tử có ngoại lệ quan trọng: nếu vector phải di chuyển kiểu không thể copy và move constructor có thể ném, tác động sau ngoại lệ có thể không được xác định rõ bởi bảo đảm mạnh. Không suy rộng kết luận trong sách cho mọi overload và mọi kiểu phần tử. Ngoài ra, `pop_back()` yêu cầu vector không rỗng; không ném ngoại lệ không có nghĩa là hợp lệ khi gọi sai tiền điều kiện. Với `swap`, cần tuân thủ điều kiện tương thích allocator. Xem thêm phần exception safety chung ở chương 6.
:::

## 7.3.5 Ví dụ: thao tác với câu

Ví dụ sau giữ trình tự thao tác của sách: dành chỗ, thêm từ, in thông tin, sửa câu rồi xóa hai phần tử cuối.

```cpp
#include <algorithm>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>

int main() {
    std::vector<std::string> sentence;
    sentence.reserve(5);
    sentence.push_back("Hello,");
    sentence.insert(sentence.end(), {"how", "are", "you", "?"});

    std::copy(sentence.cbegin(), sentence.cend(),
              std::ostream_iterator<std::string>(std::cout, " "));
    std::cout << "\nmax_size(): " << sentence.max_size()
              << "\nsize(): " << sentence.size()
              << "\ncapacity(): " << sentence.capacity() << '\n';

    std::swap(sentence[1], sentence[3]);
    sentence.insert(std::find(sentence.begin(), sentence.end(), "?"), "always");
    sentence.back() = "!";
    std::copy(sentence.cbegin(), sentence.cend(),
              std::ostream_iterator<std::string>(std::cout, " "));
    std::cout << "\nsize(): " << sentence.size()
              << "\ncapacity(): " << sentence.capacity() << '\n';

    sentence.pop_back();
    sentence.pop_back();
    sentence.shrink_to_fit();
    std::cout << "size(): " << sentence.size()
              << "\ncapacity(): " << sentence.capacity() << '\n';
}
```

Câu lần lượt là `Hello, how are you ?` và `Hello, you are how always !`; kích thước tương ứng là 5, 6 rồi 4. Các giá trị `max_size()` và `capacity()` phụ thuộc implementation: không thể dựa vào việc capacity luôn tăng gấp đôi. `shrink_to_fit()` chỉ là yêu cầu thu gọn, không bảo đảm capacity sẽ giảm.

## 7.3.6 Chuyên biệt `vector<bool>`

`std::vector<bool>` là một chuyên biệt dành cho giá trị Boolean. Implementation thường đóng gói nhiều bit vào một đơn vị lưu trữ để tiết kiệm bộ nhớ; cách biểu diễn và hiệu năng cụ thể phụ thuộc implementation. Đổi lại, việc truy cập có thể cần thao tác bit và khác với vector thông thường.

| Thao tác | Ý nghĩa |
|:---|:---|
| `bits.flip()` | Đảo toàn bộ các giá trị Boolean. |
| `bits[i].flip()` | Đảo giá trị tại chỉ số `i`. |
| `bits[i] = value` | Gán một giá trị Boolean. |
| `bits[i] = bits[j]` | Gán giá trị của phần tử `j` cho phần tử `i`. |

Với vector không `const`, phép truy cập trả về một đối tượng đại diện (*proxy reference*), không phải `bool&` thông thường. Proxy có thể chuyển thành `bool`, nhận phép gán và cung cấp `flip()`:

```cpp
std::vector<bool> bits{true, false, true, false, true, false};
bits.front().flip(); // đảo phần tử đầu
bits[5] = bits.back();
bool first = bits[0]; // chuyển proxy thành bool
```

Các phần tử được truy cập phải tồn tại. Với vector `const`, kiểu truy cập hằng `const_reference` là `bool` theo mô tả của sách. Lưu ý `auto x = bits[0]` có thể giữ proxy thay vì tạo bản sao `bool`; ghi rõ `bool x` nếu muốn một giá trị độc lập.

Điểm khác biệt này ảnh hưởng tới cả phép gán về sau:

```cpp
#include <cassert>
#include <vector>

int main() {
    std::vector<bool> bits{true, false};
    auto proxy = bits[0];  // đại diện cho phần tử đầu
    bool snapshot = bits[0]; // bản sao giá trị
    proxy = false;
    assert(!bits[0]);
    assert(snapshot);      // bản sao không thay đổi
}
```

Proxy gắn với vùng lưu trữ của vector: không giữ và dùng nó sau khi vector bị hủy hoặc sau một thao tác làm tham chiếu tới phần tử mất hiệu lực, chẳng hạn reallocation. Nếu cần giữ kết quả để sử dụng độc lập với vector, chuyển sang `bool` trước khi thay đổi container.

Sách cảnh báo mã template làm việc với `vector<T>` không nhất thiết hoạt động với `vector<bool>`. Cụ thể, không nên giả định có thể lấy `bool*` tới từng phần tử hoặc có vùng `bool` liên tục như vector thông thường. Sách còn nói iterator không phải random-access iterator; cách diễn đạt này phụ thuộc các yêu cầu iterator và phiên bản chuẩn, nên không nên dùng nó làm kết luận chung cho mọi implementation hiện đại.

`vector<bool>` có kích thước động; nếu cần số bit cố định được biết tại thời điểm biên dịch, sách giới thiệu `std::bitset` ở chương 12.
