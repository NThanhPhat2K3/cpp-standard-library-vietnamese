---
id: chuong-06-phan-8
title: 'Chương 6 · Thuật toán STL và phạm vi'
sidebar_label: '06 · Phần 8: Thuật toán và phạm vi'
---

# 6.4–6.4.1 · Thuật toán STL và phạm vi

> **Phạm vi:** Mục 6.4 và 6.4.1; thuật toán xử lý nhiều phạm vi ở mục 6.4.2 tiếp tục sau.  
> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 199–207 (PDF trang 228–236). Ghi chú bổ sung được đánh dấu riêng.

## Thuật toán độc lập với container

STL cung cấp thuật toán tìm kiếm, sắp xếp, sao chép, thay đổi thứ tự, biến đổi và tính toán. Phần lớn là hàm tự do trong `<algorithm>` hoặc các header liên quan, hoạt động thông qua iterator thay vì là thành viên của từng container. Nhờ vậy cùng một thuật toán có thể làm việc với nhiều kiểu container hoặc phạm vi do người dùng định nghĩa, miễn là iterator và phần tử đáp ứng yêu cầu.

Sự tách rời này giúp tái sử dụng nhưng đòi hỏi người gọi hiểu tiền điều kiện. Không phải tổ hợp container–thuật toán nào cũng biên dịch; tổ hợp biên dịch được cũng có thể không có hiệu năng mong muốn.

### Ví dụ: tìm, sắp xếp và đảo

```cpp
#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> coll{2, 5, 4, 1, 6, 3};
    auto minpos = std::min_element(coll.cbegin(), coll.cend());
    auto maxpos = std::max_element(coll.cbegin(), coll.cend());
    std::cout << "min: " << *minpos << '\n';
    std::cout << "max: " << *maxpos << '\n';

    std::sort(coll.begin(), coll.end());
    auto pos3 = std::find(coll.begin(), coll.end(), 3);
    std::reverse(pos3, coll.end());
    for (auto elem : coll) std::cout << elem << ' ';
    std::cout << '\n';
}
```

Kết quả:

```text
min: 1
max: 6
1 2 6 5 4 3
```

`min_element` và `max_element` trả iterator tới phần tử cực trị; nếu có nhiều min/max tương đương, phiên bản này trả phần tử đầu tiên tương ứng. `sort` sắp xếp toàn bộ vector theo `<` mặc định; nó cần iterator cho phép sửa và random access. `find` trả vị trí đầu tiên bằng `3`, hoặc `end` nếu không tìm thấy. `reverse(pos3, end)` đảo phần từ vị trí tìm được đến phần tử cuối; vì thao tác sửa dữ liệu nên `find` ở đây dùng iterator không const.

:::warning Container rỗng
`min_element` và `max_element` trả `end` cho phạm vi rỗng; không giải tham chiếu kết quả trước khi kiểm tra. Trong ví dụ sách, vector có sáu phần tử nên phép dereference hợp lệ. Nếu `find` không tìm thấy `3`, `reverse(end,end)` là phạm vi rỗng và không làm gì.
:::

Sách cũng đưa phiên bản trước C++11: thêm từng phần tử bằng `push_back`, ghi rõ kiểu iterator, dùng `begin`/`end` thay `cbegin`/`cend`, và duyệt bằng vòng lặp iterator thay range-based `for`.

## 6.4.1 Phạm vi `[first, last)`

Thuật toán nhận cặp iterator để có thể xử lý toàn bộ container hoặc một phần của nó. Phạm vi hợp lệ đòi hỏi `last` có thể đạt tới từ `first` bằng các bước hợp lệ theo yêu cầu thuật toán. Hai iterator không liên quan hoặc thứ tự sai có thể dẫn tới hành vi không xác định; iterator không tự đảm bảo an toàn hơn raw pointer.

Phạm vi **bao gồm** `first` và loại trừ vị trí `last`. Phạm vi rỗng được biểu diễn bằng hai iterator bằng nhau.

Ví dụ sách tạo `list<int>` từ 20 đến 40:

```cpp
std::list<int> coll;
for (int i = 20; i <= 40; ++i) coll.push_back(i);

auto pos3 = std::find(coll.begin(), coll.end(), 3);
std::reverse(pos3, coll.end()); // [end,end): không làm gì

auto pos25 = std::find(coll.begin(), coll.end(), 25);
auto pos35 = std::find(coll.begin(), coll.end(), 35);
std::cout << *std::max_element(pos25, pos35) << '\n'; // 34
std::cout << *std::max_element(pos25, std::next(pos35)) << '\n'; // 35
```

`std::next` cần `<iterator>` và ví dụ giả định cả hai giá trị tồn tại, với `25` ở trước `35`. Trong sách, `++pos35` được dùng để đưa điểm cuối qua `35`; `std::next(pos35)` ở đây không làm thay đổi biến `pos35`. Không được tăng `end`, và không được giải tham chiếu kết quả `max_element` của phạm vi rỗng.

### Khi không biết thứ tự hai vị trí

Với random-access iterator **thuộc cùng một phạm vi hợp lệ**, có thể so sánh vị trí bằng `<`; vẫn phải xử lý trường hợp một hoặc cả hai tìm kiếm thất bại. Với iterator chỉ tiến như của list, không thể so sánh vị trí bằng `<`.

Sách trình bày một cách tìm `25` trước, rồi tìm `35` trong `[begin,pos25)`; nếu không có, tìm tiếp trong `[pos25,end)`. Cách đó biết vị trí nào ở trước, nhưng có thể duyệt nhiều lần. Một cách trực tiếp hơn là tìm phần tử đầu tiên có một trong hai giá trị bằng `find_if`, rồi tìm giá trị còn lại ở phía sau:

```cpp
auto first = std::find_if(coll.begin(), coll.end(),
                          [](int value) { return value == 25 || value == 35; });
if (first == coll.end()) {
    // không tìm thấy cả hai
} else {
    const int wanted = (*first == 25) ? 35 : 25;
    auto second = std::find(std::next(first), coll.end(), wanted);
    if (second == coll.end()) {
        // không có giá trị còn lại sau phần tử đầu
    } else {
        // [first, std::next(second)) bao gồm cả hai vị trí
    }
}
```

Lambda mô tả tiêu chí tìm; sách đi sâu vào lambda trong STL ở mục 6.9. Với dữ liệu có nhiều bản sao, cần định nghĩa rõ muốn cặp vị trí nào; ví dụ này chọn lần xuất hiện đầu của một trong hai giá trị rồi tìm giá trị còn lại phía sau.
