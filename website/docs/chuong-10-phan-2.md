---
id: chuong-10-phan-2
title: 'Chương 10 · for_each và predicate'
sidebar_label: '10 · Phần 2: for_each và predicate'
---

# 10.1.3–10.1.4 · Trạng thái của `for_each` và predicate

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 482–486 (PDF trang 511–515). Các giới hạn theo overload và phiên bản được ghi rõ.

## 10.1.3 Lấy trạng thái từ `for_each`

Overload tuần tự `std::for_each(first,last,functor)` gọi functor cho các phần tử trong phạm vi rồi trả functor kết quả. Có thể dùng giá trị trả về để lấy trạng thái tích lũy mà không phải sửa đối tượng gốc:

```cpp
#include <algorithm>
#include <iostream>
#include <stdexcept>
#include <vector>

class MeanValue {
    long long count_ = 0;
    long long sum_ = 0;
public:
    void operator()(int value) { ++count_; sum_ += value; }
    double value() const {
        if (count_ == 0) throw std::logic_error("empty range");
        return static_cast<double>(sum_) / count_;
    }
};

int main() {
    std::vector<int> values{1, 2, 3, 4, 5, 6, 7, 8};
    MeanValue result = std::for_each(values.begin(), values.end(), MeanValue{});
    std::cout << "mean value: " << result.value() << '\n';
}
```

Kết quả là `mean value: 4.5`. Ví dụ sách chia cho số lượng mà không kiểm tra rỗng; ở đây `value()` báo lỗi nếu không có phần tử. `long long` vẫn có giới hạn: với dữ liệu đủ lớn, tổng có thể tràn và cần chọn cách cộng phù hợp.

Sách viết ở bối cảnh C++11 rằng `for_each` có đặc điểm trả functor. Với C++ hiện đại, cần phân biệt overload: phiên bản nhận execution policy không trả functor theo cách này; `std::ranges::for_each` có kiểu kết quả riêng. Đừng dựa vào quy tắc của overload tuần tự để suy ra hành vi của mọi thuật toán hoặc mọi chế độ thực thi.

## 10.1.4 Predicate và bản sao

Predicate là callable trả kết quả chuyển được sang `bool`, nhưng thuật toán có thể sao chép callable. Do đó, predicate mà kết quả phụ thuộc số lần gọi trên **một instance cụ thể** có thể hoạt động khác dự kiến. Sách minh họa:

```cpp
class Nth {
    int nth;
    int count = 0;
public:
    explicit Nth(int n) : nth(n) {}
    bool operator()(int) { return ++count == nth; }
};
```

Nếu truyền `Nth(3)` vào `std::remove_if`, một implementation có thể dùng bản sao khác trong các giai đoạn tìm và dồn phần tử. Sách quan sát một kết quả xóa cả phần tử thứ ba và thứ sáu trên các thư viện cũ; kết quả đó **không phải** kết quả có thể dựa vào. `remove_if` còn chỉ dồn các phần tử được giữ về đầu và trả iterator cuối logic; cần `erase` để thật sự xóa phần đuôi container phù hợp.

Nếu mục tiêu là xóa phần tử thứ ba, diễn đạt trực tiếp vị trí:

```cpp
#include <cassert>
#include <iterator>
#include <list>

int main() {
    std::list<int> values{1, 2, 3, 4, 5};
    if (values.size() >= 3) values.erase(std::next(values.begin(), 2));
    assert((values == std::list<int>{1, 2, 4, 5}));
}
```

Sách khuyên predicate “không có trạng thái”. Chính xác hơn, predicate **có thể lưu cấu hình bất biến**, chẳng hạn một ngưỡng, miễn đáp ứng hợp đồng thuật toán; điều nguy hiểm là kết quả phụ thuộc trạng thái thay đổi, thứ tự gọi hoặc số bản sao. `operator() const` giúp diễn đạt ý định nhưng không tự bảo đảm tính ổn định: callable vẫn có thể sửa dữ liệu bên ngoài hoặc `mutable` member.

Chia sẻ bộ đếm qua tham chiếu trong lambda có thể khiến các bản sao cùng dùng một bộ đếm, nhưng điều đó không tự bảo đảm thuật toán sẽ gọi predicate theo thứ tự hoặc số lần mà một phép xóa theo vị trí mong đợi. Với execution policy song song, trạng thái chia sẻ còn cần đồng bộ phù hợp. Chọn thuật toán hoặc vòng lặp diễn đạt trực tiếp yêu cầu thay vì dựa vào thứ tự gọi predicate không được bảo đảm.
