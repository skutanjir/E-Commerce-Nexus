import InfoLayout from '../../components/ui/InfoLayout';

export default function SizeGuide() {
    return (
        <InfoLayout
            title="Size Guide"
            subtitle="Find your perfect fit with our comprehensive sizing charts."
        >
            <div className="space-y-12">
                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-6">Menswear</h2>
                    <div className="overflow-hidden rounded-2xl border border-surface-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-50 font-bold text-surface-900">
                                <tr>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Chest (in)</th>
                                    <th className="p-4">Waist (in)</th>
                                    <th className="p-4">Neck (in)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                <tr>
                                    <td className="p-4 font-bold">S</td>
                                    <td className="p-4">36-38</td>
                                    <td className="p-4">30-31</td>
                                    <td className="p-4">14.5</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">M</td>
                                    <td className="p-4">39-41</td>
                                    <td className="p-4">32-33</td>
                                    <td className="p-4">15.5</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">L</td>
                                    <td className="p-4">42-44</td>
                                    <td className="p-4">34-36</td>
                                    <td className="p-4">16.5</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">XL</td>
                                    <td className="p-4">45-47</td>
                                    <td className="p-4">38-40</td>
                                    <td className="p-4">17.5</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-display font-bold text-surface-900 mb-6">Womenswear</h2>
                    <div className="overflow-hidden rounded-2xl border border-surface-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-50 font-bold text-surface-900">
                                <tr>
                                    <th className="p-4">Size</th>
                                    <th className="p-4">Bust (in)</th>
                                    <th className="p-4">Waist (in)</th>
                                    <th className="p-4">Hips (in)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100">
                                <tr>
                                    <td className="p-4 font-bold">XS / 0-2</td>
                                    <td className="p-4">32-33</td>
                                    <td className="p-4">24-25</td>
                                    <td className="p-4">34-35</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">S / 4-6</td>
                                    <td className="p-4">34-35</td>
                                    <td className="p-4">26-27</td>
                                    <td className="p-4">36-37</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">M / 8-10</td>
                                    <td className="p-4">36-37</td>
                                    <td className="p-4">28-29</td>
                                    <td className="p-4">38-39</td>
                                </tr>
                                <tr>
                                    <td className="p-4 font-bold">L / 12-14</td>
                                    <td className="p-4">38-40</td>
                                    <td className="p-4">30-32</td>
                                    <td className="p-4">40-42</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="bg-surface-900 p-8 rounded-3xl text-white">
                    <h3 className="text-xl font-bold mb-4">How to Measure</h3>
                    <ul className="space-y-4 text-surface-400 text-sm">
                        <li><strong className="text-white">Chest/Bust:</strong> Measure around the fullest part of your chest, keeping the tape horizontal.</li>
                        <li><strong className="text-white">Waist:</strong> Measure around the narrowest part (typically where your body bends side to side).</li>
                        <li><strong className="text-white">Hips:</strong> Measure around the fullest part of your hips with your feet together.</li>
                    </ul>
                </div>
            </div>
        </InfoLayout>
    );
}
