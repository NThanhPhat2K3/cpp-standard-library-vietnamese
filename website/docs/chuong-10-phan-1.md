---
id: chuong-10-phan-1
title: 'Chương 10 · Function object và trạng thái'
sidebar_label: '10 · Phần 1: Function object và trạng thái'
---

# 10.1–10.1.2 · Function object và trạng thái

> **Nguồn:** Nicolai M. Josuttis, *The C++ Standard Library*, ấn bản thứ hai, trang 475–481 (PDF trang 504–510). Các ghi chú bổ sung được phân biệt trong nội dung.

## Function object là gì?

Function object, còn gọi là *functor*, là đối tượng có thể được gọi nhờ `operator()`. Khi viết `object(args...)`, lời gọi tương ứng tới toán tử của đối tượng được thực hiện. Lambda cũng tạo một đối tượng có thể gọi, với các quy tắc capture và kiểu closure riêng.

Sách nêu ba lợi ích của functor:

1. Đối tượng có thể giữ trạng thái riêng; hai instance cùng kiểu có thể hoạt động khác nhau.
2. Kiểu functor có thể là đối số template, ví dụ một comparator tạo thành một phần kiểu của `std::set`.
3. Compiler thường có cơ hội inline lời gọi khi biết kiểu functor. Hiệu năng so với con trỏ hàm phụ thuộc compiler, tối ưu và chương trình; không coi “luôn nhanh hơn” là bảo đảm.

## 10.1.1 Comparator cho người

Ví dụ sách sắp người theo họ, rồi theo tên khi họ bằng nhau:

```cpp
#include <set>
#include <string>

struct Person {
    std::string first;
    std::string last;
};
struct PersonSortCriterion {
    bool operator()(const Person& a, const Person& b) const {
        return a.last < b.last || (a.last == b.last && a.first < b.first);
    }
};

int main() {
    std::set<Person, PersonSortCriterion> people;
    people.insert(Person{"An", "Nguyen"});
    people.insert(Person{"Binh", "Tran"});
    people.insert(Person{"An", "Nguyen"}); // khóa tương đương, không thêm
    return people.size() == 2 ? 0 : 1;
}
```

Comparator mặc định được tạo cùng set và phải xác định strict weak ordering. Với tiêu chí này, hai người cùng họ và tên là tương đương đối với set dù có thể là hai người khác nhau; cần thêm khóa phân biệt hoặc chọn multiset nếu yêu cầu dữ liệu khác. Set có comparator kiểu khác là kiểu container khác; có thể xây dựng từ phạm vi thay vì gán trực tiếp. Một comparator có trạng thái cũng có thể cho các thứ tự khác nhau trong cùng kiểu, miễn thứ tự của mỗi container luôn nhất quán.

## 10.1.2 Functor có trạng thái

`IntSequence` trong sách lưu một số và tăng nó ở mỗi lần gọi:

```cpp
#include <algorithm>
#include <functional>
#include <iterator>
#include <list>

class IntSequence {
    int value;
public:
    explicit IntSequence(int initial) : value(initial) {}
    int operator()() { return ++value; }
};

int main() {
    std::list<int> values;
    std::generate_n(std::back_inserter(values), 9, IntSequence(1));
    std::generate(std::next(values.begin()), std::prev(values.end()), IntSequence(42));
    return values == std::list<int>{2, 43, 44, 45, 46, 47, 48, 49, 10} ? 0 : 1;
}
```

Lần gọi đầu tạo `2 3 4 5 6 7 8 9 10`; lần hai thay các phần tử từ thứ hai đến trước phần tử cuối, cho `2 43 44 45 46 47 48 49 10`. Một vài câu chú thích trong sách nói bắt đầu từ 1 hoặc 42, nhưng code dùng `++value`, nên kết quả thực tế bắt đầu từ **2** hoặc **43**, đúng với output in trong sách.

### Bản sao và tham chiếu

Thuật toán thường nhận functor theo giá trị và có thể sao chép nó. Do đó trạng thái trong đối tượng gốc không nhất thiết thay đổi. Nếu cần nhiều lời gọi cùng cập nhật một trạng thái, có thể lưu trạng thái bên ngoài hoặc dùng `std::ref`:

```cpp
#include <algorithm>
#include <functional>
#include <iterator>
#include <vector>

class IntSequence {
    int value;
public:
    explicit IntSequence(int initial) : value(initial) {}
    int operator()() { return ++value; }
};

int main() {
    std::vector<int> values;
    IntSequence seq(1);
    std::generate_n(std::back_inserter(values), 4, std::ref(seq)); // 2 3 4 5
    std::generate_n(std::back_inserter(values), 4, IntSequence(42)); // 43 44 45 46
    std::generate_n(std::back_inserter(values), 4, seq); // copy: 6 7 8 9
    std::generate_n(std::back_inserter(values), 4, seq); // copy khác: 6 7 8 9
    return values.size() == 16 && values[8] == 6 && values[12] == 6 ? 0 : 1;
}
```

Sách dùng cách chỉ định tường minh tham số template của `generate_n` là kiểu tham chiếu; `std::ref(seq)` thể hiện ý định chia sẻ trạng thái rõ hơn. `seq` phải sống lâu hơn lời gọi thuật toán. Một cách khác là dùng giá trị functor trả về từ `std::for_each`; điều đó được trình bày ở mục tiếp theo. Không mặc định mọi thuật toán hay mọi phiên bản thực thi đều có quy tắc sao chép và trả trạng thái giống nhau.
