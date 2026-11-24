---
id: chuong-08-phan-4
title: 'Chương 8 · Chèn một phần tử'
sidebar_label: '08 · Phần 4: Chèn một phần tử'
---

# 8.7.1 · Chèn một phần tử

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 411–416 (PDF trang 440–445). Các chi tiết phụ thuộc overload và phiên bản được làm rõ bên dưới.

## `insert` và `emplace` trong associative container

Với `set`, `map` và các biến thể unordered, `insert(value)` hoặc `emplace(args...)` tìm vị trí theo comparator hoặc hash/equality. Overload `insert` nhận lvalue thường sao chép; overload nhận rvalue có thể move. `emplace` chuyển tiếp đối số để xây dựng phần tử.

| Loại container | Giá trị trả về khi không dùng hint |
|:---|:---|
| `set`, `map`, `unordered_set`, `unordered_map` | `pair<iterator,bool>`: `second` báo chèn thành công, `first` trỏ tới phần tử mới hoặc phần tử tương đương đã tồn tại. |
| Các biến thể `multi` | Iterator tới phần tử vừa được thêm; cho phép khóa tương đương. |

Với map, phần tử là cặp khóa–giá trị. Có thể dùng overload chuyển đổi phù hợp để chèn pair có kiểu tương thích. `emplace` **không bắt buộc** dùng `piecewise_construct`; kỹ thuật đó hữu ích khi cần chuyển riêng các tập đối số cho constructor của khóa và giá trị.

```cpp
#include <map>
#include <string>

int main() {
    std::map<std::string, int> scores;
    auto first = scores.emplace("An", 10);
    auto second = scores.insert({"An", 20});
    return first.second && !second.second && second.first->second == 10 ? 0 : 1;
}
```

Container ordered không làm mất hiệu lực iterator và tham chiếu tới phần tử đã có khi chèn. Unordered container giữ tham chiếu và con trỏ tới phần tử hiện có, nhưng rehash có thể làm iterator mất hiệu lực. Không coi việc số phần tử bằng ngưỡng load factor là bằng chứng chắc chắn đã rehash.

### Dựng riêng khóa và giá trị với `piecewise_construct`

Khi constructor của khóa và giá trị cần các bộ đối số riêng, `std::piecewise_construct` cùng hai tuple chuyển chúng đến hai phần của `pair`:

```cpp
#include <cassert>
#include <map>
#include <string>
#include <tuple>
#include <utility>

struct Reading {
    int value;
    std::string unit;
    Reading(int v, const std::string& u) : value(v), unit(u) {}
};

int main() {
    std::map<std::string, Reading> readings;
    auto result = readings.emplace(
        std::piecewise_construct,
        std::forward_as_tuple(3, 'A'),      // string gồm ba ký tự A
        std::forward_as_tuple(25, "C"));    // Reading(25, "C")
    assert(result.second);
    assert(result.first->first == "AAA");
    assert(result.first->second.value == 25);
    assert(result.first->second.unit == "C");
}
```

Hai tuple mô tả đối số của `first` và `second`, không phải hai phần tử được chèn riêng. `forward_as_tuple` giữ tham chiếu tới đối số, nên chỉ dùng các tuple tạm này trong cùng biểu thức; không lưu chúng để dùng sau khi đối số tạm đã hết vòng đời. Với trường hợp đơn giản, `emplace(key, value)` thường đã đủ.

Với nhóm multi, overload chèn **không hint** đặt phần tử mới ở cuối nhóm khóa tương đương theo bảo đảm tương ứng; không suy rộng quy tắc này cho mọi overload có hint. Nếu chèn bị từ chối do trùng, không nên mặc định mọi đối số rvalue đều đã bị move: hành vi phụ thuộc hàm và cách dựng phần tử. Từ C++17, `try_emplace` hỗ trợ trường hợp map không dựng mapped value khi khóa đã có, theo hợp đồng của nó.

## Chèn tại vị trí hoặc với hint

| Hàm | Ý nghĩa | Nhóm trong sách |
|:---|:---|:---|
| `insert(pos,value)` | Sequence: chèn trước `pos`. Associative: `pos` là hint. Trả iterator tới phần tử mới hoặc phần tử tương đương đã có. | Vector, deque, list, string và associative/unordered container. |
| `emplace(pos,args...)` | Dựng phần tử trước `pos`. | Vector, deque, list. |
| `emplace_hint(pos,args...)` | Dựng và chèn với hint; trả iterator kết quả. | Associative và unordered container. |

Với associative container có thứ tự, hint đúng ngay **sau vị trí cần chèn** cho phép độ phức tạp hằng số khấu hao; nếu không, tìm kiếm tổng quát logarithmic. Với unordered container, không áp dụng công thức logarithmic này: độ phức tạp trung bình và xấu nhất dựa trên bảng băm. Hint không thay thế comparator hay ép thứ tự sai.

Iterator `pos` phải hợp lệ cho overload và container đích. Mã không được giả định một lời gọi trả iterator mới sẽ giữ cho mọi iterator cũ hợp lệ:

- **Vector:** nếu reallocate, mọi iterator, con trỏ và tham chiếu tới phần tử cũ mất hiệu lực. Nếu không, những cái ở trước điểm chèn còn hợp lệ; tại và sau điểm chèn, gồm `end()` cũ, mất hiệu lực.
- **Deque:** chèn ở đầu hoặc cuối làm iterator cũ mất hiệu lực nhưng giữ tham chiếu tới phần tử cũ; chèn ở giữa làm mất hiệu lực iterator và tham chiếu tới các phần tử.
- **List:** chèn không làm mất hiệu lực iterator hay tham chiếu tới các phần tử khác.
- **String:** các thao tác không hằng có quy tắc mất hiệu lực riêng; không giữ con trỏ hay iterator qua sửa đổi nếu hợp đồng cụ thể không bảo đảm.

## Thêm ở đầu và cuối

| Hàm | Nhóm cung cấp | Hành vi |
|:---|:---|:---|
| `push_front(value)` | Deque, list, forward_list. | Thêm một bản sao hoặc move vào đầu. |
| `emplace_front(args...)` | Deque, list, forward_list. | Dựng phần tử đầu từ đối số. |
| `push_back(value)` | Vector, deque, list, string. | Thêm vào cuối; string nhận ký tự. |
| `emplace_back(args...)` | Vector, deque, list. | Dựng phần tử cuối từ đối số. |

Trong C++11, các `emplace_front/back` trong bảng trả `void`; từ C++17 chúng trả tham chiếu tới phần tử được thêm. `forward_list` không có `push_back`/`emplace_back` và thay chèn theo iterator bằng `insert_after`/`emplace_after`; không hiểu câu tương đương `insert(begin(), value)` trong sách là một lời gọi hợp lệ cho forward_list.

Với `vector::push_back` không reallocate, iterator/tham chiếu tới các phần tử cũ vẫn hợp lệ, nhưng `end()` cũ không còn hợp lệ. Với deque, thêm ở một đầu làm iterator cũ mất hiệu lực nhưng giữ tham chiếu tới phần tử cũ. Với list và forward_list, các iterator/tham chiếu tới phần tử đã có vẫn hợp lệ.

## Ngoại lệ

Sách mô tả nhiều phép chèn một phần tử theo bảo đảm mạnh: hoặc thành công, hoặc không có tác động nếu ngoại lệ phát sinh, với các điều kiện về copy/move, hash và thao tác phần tử. Cần đọc hợp đồng của **từng overload**: ví dụ với vector, nếu kiểu không thể copy và move constructor có thể ném khi reallocate, bảo đảm mạnh có ngoại lệ. Với unordered container, hash/equality và allocator cũng ảnh hưởng tới trường hợp ngoại lệ. Không coi một lời gọi chèn nhiều phần tử là tự động có cùng bảo đảm như chèn một phần tử.
