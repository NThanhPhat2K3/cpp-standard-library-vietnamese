#include <algorithm>
#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers{7, 2, 9, 4};
    auto position = std::find(numbers.begin(), numbers.end(), 9);
    if (position != numbers.end()) {
        std::cout << "Tim thay: " << *position << '\n';
    }
}
