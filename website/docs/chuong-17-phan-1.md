---
id: chuong-17-phan-1
title: 'Chương 17 · Số ngẫu nhiên: engine và distribution'
---

Chương 17 trình bày số ngẫu nhiên, số phức, hàm số học và `valarray`. Phần này theo mục 17.1.1, trang 907–912: thư viện `<random>` từ C++11 tách **engine**, nguồn giá trị có trạng thái, khỏi **distribution**, quy tắc ánh xạ giá trị đó thành kết quả theo phân phối mong muốn.

## Tạo số và xáo trộn

```cpp
#include <algorithm>
#include <cassert>
#include <random>
#include <vector>

int main() {
    std::default_random_engine engine;
    std::uniform_int_distribution<int> integer(10, 20);
    std::uniform_real_distribution<double> real(10.0, 20.0);
    for (int i = 0; i < 20; ++i) {
        int value = integer(engine);
        assert(value >= 10 && value <= 20);
    }
    for (int i = 0; i < 8; ++i) {
        double value = real(engine);
        assert(value >= 10.0 && value < 20.0);
    }
    std::vector<int> values{1, 2, 3, 4, 5, 6, 7, 8, 9};
    std::shuffle(values.begin(), values.end(), engine);
    std::sort(values.begin(), values.end());
    assert((values == std::vector<int>{1, 2, 3, 4, 5, 6, 7, 8, 9}));
}
```

`uniform_int_distribution<int>(a,b)` gồm cả hai đầu `[a,b]`; `uniform_real_distribution<double>(a,b)` được thiết kế cho khoảng `[a,b)`. Distribution lấy engine làm đối số qua `operator()` và làm tiến trạng thái engine. `std::shuffle` cũng dùng engine để xáo trộn phạm vi.

`default_random_engine` là loại engine do implementation chọn, nên dãy cụ thể có thể khác giữa các nền tảng. Engine mặc định được khởi tạo cùng trạng thái sẽ tạo cùng dãy trên cùng implementation; điều này hữu ích khi tái hiện lỗi. Truyền seed vào constructor hoặc gọi `seed()` để đặt trạng thái ban đầu khác.

## Tránh tạo lại engine mỗi lần

Nếu mỗi lần `shuffle` tạo một engine tạm với cùng trạng thái ban đầu, cùng một cách hoán đổi vị trí có thể lặp lại. Giữ engine sống qua nhiều lần gọi để trạng thái tiếp tục tiến. Hai kết quả vẫn có thể trùng nhau tình cờ; trạng thái khác không bảo đảm mỗi hoán vị khác nhau.

Tương tự, dùng `engine() % n` để đưa kết quả về một khoảng có thể tạo **modulo bias** khi số lượng giá trị engine không chia hết cho `n`, và có thể phơi bày chất lượng kém của các bit thấp. Dùng `uniform_int_distribution` để ánh xạ khoảng phù hợp; chất lượng cuối cùng vẫn phụ thuộc engine và mục đích sử dụng.

## Lưu và khôi phục trạng thái

Engine hỗ trợ ghi/đọc trạng thái qua stream, và `discard(n)` tiến trạng thái bỏ qua `n` giá trị. Ví dụ với `mt19937`:

```cpp
#include <cassert>
#include <random>
#include <sstream>

int main() {
    std::mt19937 engine(42);
    engine();
    std::stringstream saved;
    saved << engine;
    const auto next = engine();
    saved >> engine;
    assert(saved && engine() == next);
    engine.discard(2);
}
```

Một engine giả ngẫu nhiên có thể dự đoán khi biết trạng thái; seed khác không biến nó thành nguồn bảo mật. `std::random_device` có thể được dùng làm nguồn seed tùy implementation, nhưng không nên tự suy ra bảo đảm mật mã từ tên gọi hoặc từ ví dụ này. Sách tiếp tục mô tả các engine và distribution cụ thể ở các mục sau.

### Cùng trạng thái, cùng dãy

Ví dụ ở trang 913–915 của sách so sánh hai engine được khởi tạo giống nhau, lưu trạng thái, khôi phục rồi bỏ qua hai giá trị. Dưới đây là phiên bản kiểm tra các quan hệ đó mà không phụ thuộc dãy số cụ thể của `default_random_engine`:

```cpp
#include <cassert>
#include <random>
#include <sstream>
#include <vector>

int main() {
    using Engine = std::default_random_engine;
    Engine first, same;
    for (int i = 0; i < 6; ++i) {
        const auto x = first();
        const auto y = same();
        assert(x == y);
    }

    std::stringstream saved;
    saved << first;
    std::vector<Engine::result_type> sequence;
    for (int i = 0; i < 6; ++i) sequence.push_back(first());

    saved >> first;
    assert(saved);
    for (int i = 0; i < 6; ++i) {
        const auto value = first();
        assert(value == sequence[i]);
    }

    saved.clear();
    saved.seekg(0);
    saved >> first;
    assert(saved);
    first.discard(2);
    const auto afterDiscard = first();
    assert(afterDiscard == sequence[2]);
}
```

`clear()` xóa trạng thái lỗi/EOF của stream và `seekg(0)` đưa vị trí đọc về đầu trước lần khôi phục thứ hai. Tương tự, nếu truyền engine **theo giá trị** vào hàm, hàm chạy trên bản sao trạng thái; hai lần truyền cùng một engine chưa thay đổi có thể tạo cùng dãy. Truyền bằng tham chiếu khi muốn các lời gọi cùng làm tiến engine gốc. `Engine::result_type` cho biết kiểu kết quả; `Engine::min()` và `Engine::max()` cho biết hai cận có thể sinh, đều được tính vào miền.
